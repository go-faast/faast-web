import { difference } from 'lodash'

import web3 from 'Services/Web3'
import { addHexPrefix } from 'Utilities/helpers'
import { ZERO, toBigNumber, toSmallestDenomination, toMainDenomination, toHex, toTxFee } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { ellipsize } from 'Utilities/display'
import log from 'Utilities/log'

import { batchRequest, tokenBalanceData, tokenSendData, web3SendTx } from './util'
import Wallet from '../Wallet'

@abstractMethod('getType', 'getTypeLabel', 'getAddress', '_signTxData')
export default class EthereumWallet extends Wallet {

  static type = 'EthereumWallet';

  constructor() {
    super()
    assertExtended(this, EthereumWallet)
  }

  getId = () => this.getAddress().toLowerCase();

  getLabel = () => this.label || `Ethereum ${ellipsize(this.getAddress(), 6, 4)}`;

  isSingleAddress = () => true;

  getFreshAddress = (assetOrSymbol) => Promise.resolve(assetOrSymbol)
    .then(::this.assertAssetSupported)
    .then(() => this.getAddress());

  isAssetSupported = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  };

  getBalance = (assetOrSymbol, { web3Batch = null } = {}) => {
    const asset = this.getSupportedAsset(assetOrSymbol)
    if (!asset) {
      return Promise.resolve(ZERO)
    }
    const address = this.getAddress()
    let request
    if (asset.symbol === 'ETH') {
      request = batchRequest(web3Batch, web3.eth.getBalance, address, 'latest')
    } else { // Handle ERC20
      request = batchRequest(web3Batch, web3.eth.call, {
        to: asset.contractAddress,
        data: tokenBalanceData(address)
      }, 'latest')
    }
    return request.then((balance) => toMainDenomination(balance, asset.decimals))
  };

  getAllBalances = ({ web3Batch = null } = {}) => Promise.resolve(this.getSupportedAssets())
    .then((assets) => {
      const batch = web3Batch || new web3.BatchRequest()
      const balanceRequests = assets.map(({ symbol }) =>
        this.getBalance(symbol, { web3Batch: batch })
          .then((balance) => ({ symbol, balance })))
      if (!web3Batch) {
        // Don't execute batch if passed in as option
        batch.execute()
      }
      return Promise.all(balanceRequests)
    }).then((balances) => balances.reduce((result, { symbol, balance }) => ({
      ...result,
      [symbol]: balance
    }), {}));

  createTransaction = (toAddress, amount, assetOrSymbol, options = {}) => Promise.resolve(assetOrSymbol)
    .then(::this.assertAssetSupported)
    .then((asset) => {
      log.debug(`Create transaction sending ${amount} ${asset.symbol} from ${this.getAddress()} to ${toAddress}`)
      let txData = {
        from: this.getAddress(),
        value: ZERO,
        data: ''
      }
      if (asset.symbol === 'ETH') {
        txData.to = toAddress
        txData.value = toSmallestDenomination(amount, asset.decimals)
      } else if (asset.ERC20) {
        // Handle ERC20
        txData.to = asset.contractAddress,
        txData.data = tokenSendData(toAddress, amount, asset.decimals)
      } else {
        throw new Error(`Unsupported asset ${asset.symbol || asset} provided to EthereumWallet`)
      }
      txData.value = toHex(txData.value)

      const previousTx = options.previousTx
      let customNonce = options.nonce
      if (!customNonce && previousTx && previousTx.txData.from.toLowerCase() == txData.from.toLowerCase()) {
        customNonce = toBigNumber(previousTx.txData.nonce).plus(1).toNumber()
      }
      const customGasPrice = options.gasPrice
      const customGasLimit = options.gasLimit || options.gas

      return Promise.all([
        customGasPrice || web3.eth.getGasPrice(),
        customGasLimit || web3.eth.estimateGas(txData),
        customNonce || web3.eth.getTransactionCount(txData.from)
      ]).then(([gasPrice, gasLimit, nonce]) => ({
        walletId: this.getId(),
        toAddress,
        amount,
        assetSymbol: asset.symbol,
        feeAmount: toTxFee(gasLimit, gasPrice),
        feeSymbol: 'ETH',
        signed: false,
        sent: false,
        txData: {
          ...txData,
          gasPrice: toHex(gasPrice),
          gasLimit: toHex(gasLimit),
          nonce: toHex(nonce)
        },
        signedTxData: null
      }))
      .then((tx) => log.debugInline('createTransaction', tx))
    });

  _sendSignedTxData (signedTxData, options = {}) {
    return web3SendTx(signedTxData.raw, true, options)
      .then((txId) => ({ id: txId }));
  }

  _validateTxData = (txData) => {
    if (txData === null || typeof txData !== 'object') {
      log.error('invalid txData', txData)
      throw new Error(`Invalid ${EthereumWallet.type} txData of type ${typeof tx}`)
    }
    const requiredProps = ['data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
    const missingProps = difference(requiredProps, Object.keys(txData))
    if (missingProps.length > 0) {
      log.debug('invalid txData', txData)
      throw new Error(`Invalid ${EthereumWallet.type} txData - missing required props ${missingProps}`)
    }
    return txData
  };

  _validateSignedTxData = (signedTxData) => {
    if (signedTxData === null || typeof signedTxData !== 'object') {
      log.error('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData of type ${typeof tx}`)
    }
    const { raw } = signedTxData
    if (typeof raw !== 'string') {
      log.error('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData - invalid prop "raw" of type ${typeof raw}`)
    }
    return signedTxData
  }

  _signedEthJsTxToObject = (ethJsTx) => {
    ethJsTx.validate('Invalid ethJsTx signature')
    return {
      raw: addHexPrefix(ethJsTx.serialize().toString('hex')),
      tx: ethJsTx
    }
  }

}

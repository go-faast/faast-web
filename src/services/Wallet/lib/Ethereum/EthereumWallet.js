import pad from 'pad-left'

import config from 'Config'
import web3 from 'Services/Web3'
import { addHexPrefix } from 'Utilities/helpers'
import { toBigNumber, toSmallestDenomination, toMainDenomination, toHex, toTxFee } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { ellipsize } from 'Utilities/display'
import log from 'Utilities/log'

import Wallet from '../Wallet'

const tokenSendData = (address, amount, decimals) => {
  amount = toBigNumber(amount)

  if (!web3.utils.isAddress(address)) return { error: 'invalid address' }
  if (amount.lessThan(0)) return { error: 'invalid amount' }
  if (typeof decimals !== 'number') return { error: 'invalid decimals' }

  const dataAddress = pad(address.toLowerCase().replace('0x', ''), 64, '0')
  const power = toBigNumber(10).toPower(decimals)
  const dataAmount = pad(amount.times(power).toString(16), 64, '0')
  return config.tokenFunctionSignatures.transfer + dataAddress + dataAmount
};

const tokenBalanceData = (walletAddress) => {
  if (walletAddress.startsWith('0x')) walletAddress = walletAddress.slice(2)
  return config.tokenFunctionSignatures.balanceOf + pad(walletAddress, 64, '0')
};

const batchRequest = (batch, batchableFn, ...fnArgs) => {
  if (batch) {
    return new Promise((resolve, reject) => {
      batch.add(
        batchableFn.request(...fnArgs, (err, result) => {
          if (err) return reject(err)

          resolve(result)
        })
      )
    })
  }
  return batchableFn(...fnArgs)
}

/** Send the serialized transaction string and return a promise that resolves after the
  * transaction is broadcast to the network.
  */
const sendSerializedTx = (serializedTx, options) => new Promise((resolve, reject) => {
  const { onTxHash, onReceipt, onConfirmation, onError } = options
  // sendSignedTransaction resolves when the tx receipt is available, which occurs after
  // confirmation, but we need to resolve right after sending so wrapping in a new
  // promise is necessary
  let resolved = false
  const sendStatus = web3.eth.sendSignedTransaction(serializedTx)
    .once('transactionHash', (txId) => {
      resolve(txId)
      resolved = true
    })
    .once('error', (e) => {
      if (!resolved) {
        // Avoid rejecting after resolve was called
        reject(e)
      }
    })
  if (typeof onTxHash === 'function') sendStatus.once('transactionHash', onTxHash)
  if (typeof onReceipt === 'function') sendStatus.once('receipt', onReceipt)
  if (typeof onConfirmation === 'function') sendStatus.on('confirmation', onConfirmation)
  if (typeof onError === 'function') sendStatus.on('error', onError)
});

@abstractMethod('getType', 'getTypeLabel', 'getAddress', '_signTxData')
export default class EthereumWallet extends Wallet {

  constructor() {
    super()
    assertExtended(this, EthereumWallet)
  }

  getId = () => this.getAddress();

  getLabel = () => this.label || `Ethereum ${ellipsize(this.getAddress(), 6, 4)}`;

  getIconUrl = () => 'https://faa.st/img/coins/coin_ETH.png';

  isSingleAddress = () => true;

  getFreshAddress = (assetOrSymbol) => Promise.resolve(assetOrSymbol)
    .then(this.assertAssetSupported)
    .then(() => this.getAddress());

  isAssetSupported = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  };

  getBalance = (assetOrSymbol, { web3Batch = null } = {}) => {
    const asset = this.getSupportedAsset(assetOrSymbol)
    if (!asset) {
      return Promise.resolve(toBigNumber(0))
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
    .then(this.assertAssetSupported)
    .then((asset) => {
      log.debug(`Sending ${amount} ${asset.symbol} from ${this.getAddress()} to ${toAddress}`)
      let tx = {
        chainId: 1,
        from: this.getAddress(),
        value: toBigNumber(0),
        data: ''
      }
      if (asset.symbol === 'ETH') {
        tx.to = toAddress
        tx.value = toSmallestDenomination(amount, asset.decimals)
      } else if (asset.ERC20) {
        // Handle ERC20
        tx.to = asset.contractAddress,
        tx.data = tokenSendData(toAddress, amount, asset.decimals)
      } else {
        throw new Error(`Unsupported asset ${asset.symbol || asset} provided to EthereumWallet`)
      }
      tx.value = toHex(tx.value)

      const previousTx = options.previousTx
      let customNonce = options.nonce
      if (!customNonce && previousTx && previousTx.txData.from === tx.from) {
        customNonce = toBigNumber(previousTx.txData.nonce).plus(1).toNumber()
      }
      const customGasPrice = options.gasPrice
      const customGasLimit = options.gasLimit || options.gas

      return Promise.all([
        customGasPrice || web3.eth.getGasPrice(),
        customGasLimit || web3.eth.estimateGas(tx),
        customNonce || web3.eth.getTransactionCount(tx.from)
      ]).then(([gasPrice, gasLimit, nonce]) => ({
        walletId: this.getId(),
        toAddress,
        amount,
        asset,
        signed: false,
        feeAmount: toTxFee(gasLimit, gasPrice),
        feeAsset: 'ETH',
        txData: {
          ...tx,
          gasPrice: toHex(gasPrice),
          gasLimit: toHex(gasLimit),
          nonce: toHex(nonce)
        }
      }))
      .then((tx) => log.debugInline('createTransaction', ({
        ...tx,
        ...tx.txData // TODO: Added for back compat. Remove after refactoring
      })))
    });

  _sendSignedTxData = (signedTxData, options = {}) => sendSerializedTx(signedTxData.raw, options);

  _validateTxData = (txData) => {
    if (txData === null || txData !== 'object') {
      throw new Error(`Invalid ${EthereumWallet.type} txData of type ${typeof tx}`)
    }
    const requiredProps = ['chainId', 'data', 'from', 'gasLimit', 'gasPrice', 'nonce', 'to', 'value']
    if (!requiredProps.every(txData.hasOwnProperty.bind(txData))) {
      log.debug('invalid txData', txData)
      throw new Error(`Invalid ${EthereumWallet.type} txData - missing require props`)
    }
    return txData
  };

  _validateSignedTxData = (signedTxData) => {
    if (signedTxData === null || signedTxData !== 'object') {
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData of type ${typeof tx}`)
    }
    if (!signedTxData.raw) {
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData - missing prop "raw"`)
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
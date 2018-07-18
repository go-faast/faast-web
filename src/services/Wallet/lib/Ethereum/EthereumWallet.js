import { difference } from 'lodash'

import config from 'Config'
import web3 from 'Services/Web3'
import { addHexPrefix, toHashId } from 'Utilities/helpers'
import { ZERO, toBigNumber, toSmallestDenomination, toMainDenomination, toHex, toTxFee } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { ellipsize } from 'Utilities/display'
import log from 'Utilities/log'

import { batchRequest, tokenBalanceData, tokenSendData, web3SendTx, toUniversalReceipt } from './util'
import Wallet from '../Wallet'

const DEFAULT_GAS_PRICE = 21e9 // 21 Gwei

@abstractMethod('getType', 'getTypeLabel', 'getAddress', '_signTx')
export default class EthereumWallet extends Wallet {

  static type = 'EthereumWallet';

  constructor(address, label) {
    super(toHashId(address.toLowerCase()), label)
    assertExtended(this, EthereumWallet)
    this.address = address
  }

  getLabel() { return this.label || `Ethereum ${ellipsize(this.getAddress(), 6, 4)}` }

  getAddress() { return this.address }

  isSingleAddress() { return true }

  getFreshAddress(assetOrSymbol) {
    return Promise.resolve(assetOrSymbol)
      .then(::this.assertAssetSupported)
      .then(() => this.getAddress())
  }

  isAssetSupported(assetOrSymbol) {
    const asset = this.getAsset(assetOrSymbol)
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  }

  _getDefaultFeeRate() {
    return web3.eth.getGasPrice()
      .catch((e) => {
        log.error('Failed to get ethereum dynamic fee, using default', e)
        return DEFAULT_GAS_PRICE
      })
      .then((gasPrice) => ({
        rate: gasPrice,
        unit: 'wei/gas'
      }))
  }

  _getBalance(asset, { web3Batch = null } = {}) {
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
  }

  getAllBalances({ web3Batch = null } = {}) {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => {
        const batch = web3Batch || new web3.BatchRequest()
        const balanceRequests = assets.map((asset) =>
          this._getBalance(asset, { web3Batch: batch })
            .then((balance) => ({ symbol: asset.symbol, balance })))
        if (!web3Batch) {
          // Don't execute batch if passed in as option
          batch.execute()
        }
        return Promise.all(balanceRequests)
      }).then((balances) => balances.reduce(
        (result, { symbol, balance }) => (balance.gt(ZERO) || symbol === 'ETH')
          ? ({ ...result, [symbol]: balance })
          : result,
        {}))
  }

  _createTransaction(toAddress, amount, asset, options = {}) {
    return Promise.resolve().then(() => {
      log.debug(`Create transaction sending ${amount} ${asset.symbol} from ${this.getAddress()} to ${toAddress}`)
      let txData = {
        chainId: config.ethereumChainId,
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
        throw new Error(`Unsupported asset ${asset.symbol || asset} provided to EthereumWallet.createTransaction`)
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
        customGasPrice || this._getDefaultFeeRate(asset).then(({ rate }) => rate),
        customGasLimit || web3.eth.estimateGas(txData),
        customNonce || web3.eth.getTransactionCount(txData.from)
      ]).then(([gasPrice, gasLimit, nonce]) => ({
        feeAmount: toTxFee(gasLimit, gasPrice),
        feeSymbol: 'ETH',
        txData: {
          ...txData,
          gasPrice: toHex(gasPrice),
          gasLimit: toHex(gasLimit),
          nonce: toHex(nonce)
        },
      }))
      .then((tx) => log.debugInline('createTransaction', tx))
    })
  }

  _getTransactionReceipt(txId) {
    return web3.eth.getTransactionReceipt(txId)
      .then(toUniversalReceipt)
  }

  _sendSignedTx(tx, options = {}) {
    return web3SendTx(tx.signedTxData.raw, true, options)
      .then((txId) => ({ id: txId }))
  }

  _validateTxData(txData) {
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
  }

  _validateSignedTxData(signedTxData) {
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

  _signedEthJsTxToObject(ethJsTx) {
    const validationError = ethJsTx.validate(true)
    if (validationError) {
      throw new Error(validationError)
    }
    return {
      raw: addHexPrefix(ethJsTx.serialize().toString('hex')),
      tx: ethJsTx
    }
  }

}

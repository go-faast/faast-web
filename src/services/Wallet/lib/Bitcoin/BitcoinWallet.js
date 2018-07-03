import log from 'Utilities/log'
import { toBigNumber, toMainDenomination } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { ellipsize } from 'Utilities/display'
import Bitcore from 'Services/Bitcore'

import Wallet from '../Wallet'

const supportedAssets = ['BTC']

@abstractMethod('getTypeLabel', 'createTransaction', '_signTx', '_sendSignedTx', '_validateTxData', '_validateSignedTxData')
export default class BitcoinWallet extends Wallet {

  static type = 'BitcoinWallet';

  constructor(xpub, label) {
    super(label)
    assertExtended(this, BitcoinWallet)
    this.assetSymbol = 'BTC'
    this.xpub = xpub
    this.bitcore = Bitcore.getNetwork(this.assetSymbol)
    this._latestDiscoveryResult = null
  }

  getId() { return this.xpub }

  getLabel() { return this.label || `Bitcoin ${ellipsize(this.xpub, 8, 4)}` }

  isAssetSupported(assetOrSymbol) { return supportedAssets.includes(this.getSymbol(assetOrSymbol)) }

  isSingleAddress() { return false }

  _performDiscovery() {
    const discoveryPromise = this.bitcore.discoverAccount(this.xpub)
      .then((result) => {
        log.debug(`bitcore result for ${this.assetSymbol}`, result)
        this._latestDiscoveryResult = result
        return result
      });
    this._latestDiscoveryResult = discoveryPromise
    return discoveryPromise
  }

  _getDiscoveryResult() {
    return Promise.resolve(this._latestDiscoveryResult)
      .then((result) => {
        if (!result) {
          return this._performDiscovery()
        }
        return result
      })
  }

  getFreshAddress(assetOrSymbol, { index = 0 } = {}) {
    return Promise.resolve(assetOrSymbol)
      .then(::this.assertAssetSupported)
      .then(() => this._getDiscoveryResult())
      .then(({ unusedAddresses }) => unusedAddresses[index])
  }

  getBalance(assetOrSymbol) {
    return Promise.resolve(assetOrSymbol)
      .then(::this.getSupportedAsset)
      .then((asset) => {
        if (!asset) {
          return toBigNumber(0)
        }
        return this._performDiscovery(asset.symbol)
          .then(({ balance }) => toMainDenomination(balance, asset.decimals))
      })
  }

  _getTransactionReceipt (txId) {
    return this.bitcore.lookupTransaction(txId)
      .then((result) => !result ? null : ({
        confirmed: result.height > 0,
        succeeded: result.height > 0,
        blockNumber: result.height,
        raw: result
      }))
  }

  _sendSignedTx(tx) {
    return this.bitcore.sendTransaction(tx.signedTxData)
      .then((txId) => ({
        id: txId,
      }))
  }

  _validateSignedTxData(signedTxData) {
    if (typeof signedTxData !== 'string') {
      throw new Error(`Invalid ${this.getType()} signedTxData of type ${typeof signedTxData}`)
    }
    return signedTxData
  }

}

import log from 'Utilities/log'
import { toHashId } from 'Utilities/helpers'
import { toMainDenomination } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import { ellipsize } from 'Utilities/display'
import { fetchGet } from 'Utilities/fetch'
import Bitcore from 'Services/Bitcore'

import Wallet from '../Wallet'

const supportedAssets = ['BTC']

const DEFAULT_FEE_PER_BYTE = 10

@abstractMethod('getTypeLabel', 'createTransaction', '_signTx', '_sendSignedTx', '_validateTxData', '_validateSignedTxData')
export default class BitcoinWallet extends Wallet {

  static type = 'BitcoinWallet';

  constructor(xpub, label) {
    super(toHashId(xpub), label)
    assertExtended(this, BitcoinWallet)
    this.assetSymbol = 'BTC'
    this.xpub = xpub
    this._bitcore = Bitcore.getNetwork(this.assetSymbol)
    this._latestDiscoveryResult = null
  }

  getLabel() { return this.label || `Bitcoin ${ellipsize(this.xpub, 8, 4)}` }

  isAssetSupported(assetOrSymbol) { return supportedAssets.includes(this.getSymbol(assetOrSymbol)) }

  isSingleAddress() { return false }

  _performDiscovery() {
    const discoveryPromise = this._bitcore.discoverAccount(this.xpub)
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
      .catch((e) => {
        throw new Error(`Failed to get fresh bitcoin address: ${e.message}`)
      })
  }

  _getDefaultFeeRate(asset, options = {}) {
    return fetchGet('https://api.blockcypher.com/v1/btc/main')
      .then((result) => {
        const level = options.level || 'medium' // high, medium, low
        const feePerKb = result[`${level}_fee_per_kb`] || (DEFAULT_FEE_PER_BYTE * 1000)
        return feePerKb / 1000
      })
      .catch((e) => {
        log.error('Failed to get bitcoin dynamic fee, using default', e)
        return DEFAULT_FEE_PER_BYTE
      })
      .then((feePerByte) => ({
        rate: feePerByte,
        unit: 'sat/byte'
      }))
  }

  _getBalance(asset) {
    return this._performDiscovery(asset.symbol)
      .then(({ balance }) => toMainDenomination(balance, asset.decimals))
  }

  _getTransactionReceipt (txHash) {
    return this._bitcore.lookupTransaction(txHash)
      .then((result) => !result ? null : ({
        confirmed: result.height > 0,
        succeeded: result.height > 0,
        blockNumber: result.height,
        raw: result
      }))
  }

  _sendSignedTx(tx) {
    return this._bitcore.sendTransaction(tx.signedTxData)
      .then((txHash) => {
        this._latestDiscoveryResult = null // Clear discovery cache to avoid double spending utxos
        return {
          hash: txHash,
        }
      })
  }

  _validateSignedTxData(signedTxData) {
    if (typeof signedTxData !== 'string') {
      throw new Error(`Invalid ${this.getType()} signedTxData of type ${typeof signedTxData}`)
    }
    return signedTxData
  }

}

import { abstractMethod, assertExtended } from 'Utilities/reflect'
import log from 'Utilities/log'

@abstractMethod(
  'getId', 'getType', 'getTypeLabel', 'getBalance', 'getFreshAddress', 'isAssetSupported',
  'isSingleAddress', 'createTransaction', '_signTx', '_sendSignedTx', '_getTransactionReceipt')
export default class Wallet {

  constructor(label) {
    assertExtended(this, Wallet)
    this.label = label
    this._persistAllowed = true
    this._assetProvider = () => {}
  }

  getLabel() { return this.label || this.getType() }
  setLabel(label) { this.label = label }

  isPersistAllowed() { return this._persistAllowed }
  setPersistAllowed(persistAllowed) { this._persistAllowed = persistAllowed }

  /* The following methods return default values and can be overriden by subclass where applicable */
  isReadOnly() { return false }
  isPasswordProtected() { return false }
  checkPasswordCorrect() { return true }
  isSignTransactionSupported() { return true }

  setAssetProvider(assetProvider) {
    if (typeof assetProvider !== 'function') {
      throw new Error(`Expected assetProvider to be a function, got ${typeof assetProvider}`)
    }
    this._assetProvider = assetProvider
  }

  getAllAssets() {
    const assets = this._assetProvider()
    if (typeof assets === 'object') {
      return Object.values(assets)
    }
    return assets || []
  }

  getAllAssetsBySymbol() {
    const assets = this._assetProvider()
    if (Array.isArray(assets)) {
      return assets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    return assets || {}
  }

  getSymbol(assetOrSymbol) {
    if (typeof assetOrSymbol === 'object' && assetOrSymbol !== null) {
      return assetOrSymbol.symbol
    }
    return assetOrSymbol
  }

  getAsset(assetOrSymbol) { return this.getAllAssetsBySymbol()[this.getSymbol(assetOrSymbol)] || assetOrSymbol }

  getSupportedAssets() { return this.getAllAssets().filter(::this.isAssetSupported) }

  getSupportedAssetSymbols() {
    return this.getSupportedAssets().map(({ symbol }) => symbol)
  }

  getSupportedAssetsBySymbol() {
    return this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }))
  }

  getSupportedAsset(assetOrSymbol) {
    const asset = this.getAsset(assetOrSymbol)
    return (asset && this.isAssetSupported(asset)) ? asset : null
  }

  assertAssetSupported(assetOrSymbol) {
    const asset = this.getSupportedAsset(assetOrSymbol)
    if (!asset) {
      throw new Error(`Asset ${this.getSymbol(assetOrSymbol)} not supported by ${this.type}`)
    }
    return asset
  }

  /** Default behaviour, should be overriden in subclass if applicable */
  canSendAsset(assetOrSymbol) {
    const asset = this.getSupportedAsset(assetOrSymbol)
    return asset && !this.isReadOnly()
  }

  getUnsendableAssets() { return this.getSupportedAssets().filter((asset) => !this.canSendAsset(asset)) }

  getUnsendableAssetSymbols() { return this.getUnsendableAssets().map(({ symbol }) => symbol) }

  /** Default does nothing, should be overridden in subclass */
  _validateTxData(txData) {
    return txData
  }

  /** Default does nothing, should be overridden in subclass */
  _validateSignedTxData(signedTxData) {
    return signedTxData
  }

  _validateTx(tx) {
    if (tx === null || typeof tx !== 'object') {
      log.error('invalid tx', tx)
      throw new Error(`Invalid tx of type ${typeof tx}`)
    }
    if (tx.walletId !== this.getId()) {
      log.error('invalid tx', tx)
      throw new Error(`Invalid tx provided to wallet ${this.getId()} with mismatched walletId ${tx.walletId}`)
    }
    this._validateTxData(tx.txData)
    if (tx.signed && tx.signingSupported) {
      this._validateSignedTxData(tx.signedTxData)
    }
    return tx
  }

  _assertSignTransactionSupported() {
    if (!this.isSignTransactionSupported()) {
      throw new Error(`Wallet "${this.getLabel()}" does not support signTransaction`)
    }
  }

  _signAndSendTx(tx, options = {}) {
    return this._signTx(tx, options)
      .then((signedTx) => this._sendSignedTx(signedTx, options))
  }

  signTransaction(tx, options = {}) {
    return Promise.resolve(tx)
      .then(::this._validateTx)
      .then(::this._assertSignTransactionSupported)
      .then(() => this._signTx(tx, options))
      .then((result) => log.debugInline('signTransaction', ({
        ...tx,
        ...result,
        signed: true,
      })));
  }

  sendTransaction(tx, options = {}) {
    return Promise.resolve(tx)
      .then(::this._validateTx)
      .then(() => tx.signed
        ? this._sendSignedTx(tx, options)
        : this._signAndSendTx(tx, options))
      .then((result) => log.debugInline('sendTransaction', ({
        ...tx,
        ...result,
        signed: true,
        sent: true,
      })));
  }

  getTransactionReceipt(txOrId) {
    return Promise.resolve(txOrId)
      .then((txOrId) => {
        let id = txOrId
        if (txOrId && typeof txOrId === 'object') {
          this._validateTx(txOrId)
          id = txOrId.id
        }
        if (typeof id !== 'string') {
          return null
        }
        return this._getTransactionReceipt(id)
      })
  }

  send(toAddress, amount, assetOrSymbol, options) {
    return this.createTransaction(toAddress, amount, assetOrSymbol, options)
      .then((tx) => this.sendTransaction(tx, options))
  }

  getAllBalances(options) {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => Promise.all(assets
        .map(({ symbol }) => this.getBalance(symbol, options)
          .then((balance) => ({ symbol, balance })))))
      .then((balances) => balances.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance
      }), {}))
  }

  toJSON() {
    return {
      type: this.getType(),
      ...this
    }
  }

}

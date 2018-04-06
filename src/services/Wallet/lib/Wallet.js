import { abstractMethod, assertExtended } from 'Utilities/reflect'
import log from 'Utilities/log'

@abstractMethod(
  'getId', 'getType', 'getTypeLabel', 'getBalance', 'getFreshAddress', 'isAssetSupported',
  'isSingleAddress', 'createTransaction', '_signTxData', '_sendSignedTxData')
export default class Wallet {

  constructor(label) {
    assertExtended(this, Wallet)
    this.label = label
    this._persistAllowed = true
    this._readOnly = false
    this._assetProvider = () => {}
  }

  get type() { return this.getType() }

  getLabel = () => this.label || this.getType();

  setLabel = (label) => {
    this.label = label;
  };

  setPersistAllowed = (persistAllowed) => this._persistAllowed = persistAllowed;

  isPersistAllowed = () => this._persistAllowed;

  setReadOnly = (readOnly) => this._readOnly = readOnly;

  isReadOnly = () => this._readOnly;

  /* Default to true, can be overriden by subclass if unsupported */
  isSignTransactionSupported = () => true;

  setAssetProvider = (assetProvider) => {
    if (typeof assetProvider !== 'function') {
      throw new Error(`Expected assetProvider to be a function, got ${typeof assetProvider}`)
    }
    this._assetProvider = assetProvider
  };

  getAllAssets = () => {
    const assets = this._assetProvider()
    if (typeof assets === 'object') {
      return Object.values(assets)
    }
    return assets
  };

  getAllAssetsBySymbol = () => {
    const assets = this._assetProvider()
    if (Array.isArray(assets)) {
      return assets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    return assets
  };

  getSymbol = (assetOrSymbol) => {
    if (typeof assetOrSymbol === 'object' && assetOrSymbol !== null) {
      return assetOrSymbol.symbol
    }
    return assetOrSymbol
  };

  getAsset = (assetOrSymbol) => this.getAllAssetsBySymbol()[this.getSymbol(assetOrSymbol)];

  getSupportedAssets = () => this.getAllAssets().filter(::this.isAssetSupported);

  getSupportedAssetSymbols = () => this.getSupportedAssets().map(({ symbol }) => symbol);

  getSupportedAssetsBySymbol = () => this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }));

  getSupportedAsset = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    return (asset && this.isAssetSupported(asset)) ? asset : null
  };

  assertAssetSupported = (assetOrSymbol) => {
    const asset = this.getSupportedAsset(assetOrSymbol)
    if (!asset) {
      throw new Error(`Asset ${this.getSymbol(assetOrSymbol)} not supported by ${this.type}`)
    }
    return asset
  };

  /** Default does nothing, should be overridden in subclass */
  _validateTxData (txData) {
    return txData
  }

  /** Default does nothing, should be overridden in subclass */
  _validateSignedTxData (signedTxData) {
    return signedTxData
  }

  _validateTx (tx) {
    log.debug('_validateTx', tx)
    if (tx === null || typeof tx !== 'object') {
      throw new Error(`Invalid tx of type ${typeof tx}`)
    }
    if (tx.walletId !== this.getId()) {
      throw new Error(`Invalid tx provided to wallet ${this.getId()} with mismatched walletId ${tx.walletId}`)
    }
    this._validateTxData(tx.txData)
    if (tx.signed) {
      this._validateSignedTxData(tx.signedTxData)
    }
    return tx
  }

  _assertSignTransactionSupported () {
    if (!this.isSignTransactionSupported()) {
      throw new Error(`Wallet "${this.getLabel()}" does not support signTransaction`)
    }
  }

  _signAndSendTxData (txData, options = {}) {
    return this._signTxData(txData, options)
      .then((signedTxData) => this._sendSignedTxData(signedTxData, options))
  }

  signTransaction (tx, options = {}) {
    return Promise.resolve(tx)
      .then(::this._validateTx)
      .then(::this._assertSignTransactionSupported)
      .then(() => this._signTxData(tx.txData, { ...options, tx }))
      .then((signedTxData) => log.debugInline('signTransaction', ({
        ...tx,
        signedTxData,
      })));
  }

  sendTransaction (tx, options = {}) {
    return Promise.resolve(tx)
      .then(::this._validateTx)
      .then(() => tx.signedTxData
        ? this._sendSignedTxData(tx.signedTxData, { ...options, tx })
        : this._signAndSendTxData(tx.txData, { ...options, tx }))
      .then((result) => log.debugInline('sendTransaction', ({
        ...tx,
        ...result,
      })));
  }

  transfer = (toAddress, amount, assetOrSymbol, options) =>
    this.createTransaction(toAddress, amount, assetOrSymbol, options)
      .then((tx) => this.sendTransaction(tx, options));

  getAllBalances = (options) => Promise.resolve(this.getSupportedAssets())
    .then((assets) => Promise.all(assets
      .map(({ symbol }) => this.getBalance(symbol, options)
        .then((balance) => ({ symbol, balance })))))
    .then((balances) => balances.reduce((result, { symbol, balance }) => ({
      ...result,
      [symbol]: balance
    }), {}));

  toJSON = () => ({
    type: this.getType(),
    ...this
  })

}

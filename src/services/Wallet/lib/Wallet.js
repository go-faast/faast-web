import { abstractMethod, assertExtended } from 'Utilities/reflect'
import log from 'Utilities/log'

@abstractMethod(
  'getId', 'getType', 'getTypeLabel', 'getBalance', 'isAssetSupported', 'isSingleAddress', 'getFreshAddress',
  'createTransaction', '_signTxData', '_sendSignedTxData', '_validateTxData', '_validateSignedTxData')
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

  getSupportedAssets = () => this.getAllAssets().filter(this.isAssetSupported);

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
  _validateTxData = (signedTxData) => signedTxData;

  /** Default does nothing, should be overridden in subclass */
  _validateSignedTxData = (txData) => txData;

  _validateTx = (tx) => {
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
  };

  signTransaction = (tx, options = {}) => Promise.resolve(tx)
    .then(this._validateTx)
    .then(() => this._signTxData(tx.txData, { ...options, tx }))
    .then((signedTxData) => log.debugInline('signTransaction', ({
      ...tx,
      signed: true,
      signedTxData,
    })));

  sendSignedTransaction = (tx, options = {}) => Promise.resolve(tx)
    .then(this._validateTx)
    .then(() => this._sendSignedTxData(tx.signedTxData, { ...options, tx })
    .then((result) => ({
      ...tx,
      sent: true,
      ...result,
    })));

  sendTransaction = (tx, options = {}) => Promise.resolve(tx)
    .then(this._validateTx)
    .then((tx) => this.signTransaction(tx, options))
    .then((tx) => this.sendSignedTransaction(tx, options));

  transfer = (toAddress, amount, assetOrSymbol, options) =>
    this.createTransaction(toAddress, amount, assetOrSymbol, options)
      .then((tx) => this.sendTransaction(tx, options));

  getAllBalances = (options) => {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => Promise.all(assets
        .map(({ symbol }) => this.getBalance(symbol, options)
          .then((balance) => ({ symbol, balance })))))
      .then((balances) => balances.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance
      }), {}))
  };

  toJSON = () => ({
    type: this.getType(),
    ...this
  })

}

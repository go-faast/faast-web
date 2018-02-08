import log from 'Utilities/log'
import { abstractMethod, assertExtended } from 'Utilities/reflect'

@abstractMethod('getId', 'createTransaction', 'sendTransaction', 'getBalance', 'isAssetSupported', 'isSingleAddress', 'getFreshAddress')
export default class Wallet {

  constructor(type) {
    assertExtended(this, Wallet)
    this.type = type
    this._persistAllowed = true
    this._assetProvider = () => {}
  }

  setPersistAllowed = (persistAllowed) => this._persistAllowed = persistAllowed;

  isPersistAllowed = () => this._persistAllowed;

  getId = () => this.type;

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

  transfer = (toAddress, amount, assetOrSymbol, options) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then(() => this.createTransaction(toAddress, amount, assetOrSymbol, options))
      .then((tx) => this.sendTransaction(tx, options))
  };

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

}

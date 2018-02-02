import log from 'Utilities/log'
import { abstractMethod, assertExtended } from 'Utilities/reflect'

@abstractMethod('getId', 'createTransaction', 'sendTransaction', 'getBalance', 'isAssetSupported')
export default class Wallet {

  constructor(type) {
    assertExtended(this, Wallet)
    this.type = type
    this._persistAllowed = true
    this._allAssets = {}
  }

  setPersistAllowed = (persistAllowed) => this._persistAllowed = persistAllowed;

  isPersistAllowed = () => this._persistAllowed;

  getId = () => this.type;

  setAllAssets = (allAssets) => {
    if (Array.isArray(allAssets)) {
      allAssets = allAssets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    this._allAssets = allAssets
  };

  getAllAssets = () => Object.values(this._allAssets);

  getAllAssetsBySymbol = () => this._allAssets;

  getSymbol = (assetOrSymbol) => {
    if (typeof assetOrSymbol === 'object' && assetOrSymbol !== null) {
      return assetOrSymbol.symbol
    }
    return assetOrSymbol
  };

  getAsset = (assetOrSymbol) => this._allAssets[this.getSymbol(assetOrSymbol)];

  getSupportedAssets = () => this.getAllAssets().filter(this.isAssetSupported);

  getSupportedAssetSymbols = () => this.getSupportedAssets().map(({ symbol }) => symbol);

  getSupportedAssetsBySymbol = () => this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }));

  assertAssetSupported = (assetOrSymbol) => {
    if (!this.isAssetSupported(assetOrSymbol)) {
      throw new Error(`Asset ${this.getSymbol(assetOrSymbol)} not supported by ${this.type}`)
    }
    return assetOrSymbol
  };

  transfer = (toAddress, amount, assetOrSymbol, options) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then(() => this.createTransaction(toAddress, amount, assetOrSymbol, options))
      .then((tx) => this.sendTransaction(tx, options))
  };

  getAllBalances = () => {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => Promise.all(assets
        .map(({ symbol }) => this.getBalance(symbol)
          .then((balance) => ({ symbol, balance })))))
      .then((balances) => balances.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance
      }), {}))
  };

}

import log from 'Utilities/log'
import { abstractMethod, assertExtended } from 'Utilities/reflect'

@abstractMethod('getId', 'createTransaction', 'sendTransaction', 'getBalance', 'getAllBalances', 'isAssetSupported')
export default class Wallet {

  constructor(type) {
    assertExtended(this, Wallet)
    this.type = type
    this._allAssets = []
  }

  getId = () => this.type;

  setAllAssets = (allAssets) => {
    if (Array.isArray(allAssets)) {
      allAssets = allAssets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    this._allAssets = allAssets
  };

  getAllAssets = () => this._allAssets;

  getAsset = (symbol) => {
    if (typeof symbol === 'object') {
      // Support passing in an asset object as argument
      symbol = symbol.symbol
    }
    if (typeof symbol === 'string') {
      return this._allAssets[symbol]
    } else {
      throw new Error(`Unrecognized value ${symbol} provided to getAsset`)
    }
  };

  assertAssetSupported = (asset) => {
    if (!this.isAssetSupported(asset)) {
      throw new Error(`Asset ${asset.symbol || asset} not supported by ${this.type}`)
    }
    return asset
  };

  transfer = (toAddress, amount, assetOrSymbol, options) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then(this.getAsset)
      .then((asset) => this.createTransaction(toAddress, amount, asset, options))
      .then((tx) => this.sendTransaction(tx, options))
  };

}

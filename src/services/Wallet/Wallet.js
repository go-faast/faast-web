import log from 'Utilities/log'
import { assertMethods, assertExtended } from 'Utilities/reflect'

export class Wallet {

  constructor(type) {
    assertExtended(this, Wallet)
    assertMethods(this, Wallet, 'getId', 'transfer', 'getBalance', 'getAllBalances', 'isAssetSupported')
    this.type = type
    this._allAssets = {}
  }

  setAllAssets = (allAssets) => {
    this._allAssets = allAssets
  };

  getAllAssets = () => this._allAssets;

  getAsset = (symbol) => {
    if (typeof symbol === 'object') {
      // Support passing in an asset object as argument
      symbol = symbol.symbol
    }
    return this.allAssets[symbol]
  };

  assertAssetSupported = (asset) => {
    if (!this.isAssetSupported(asset)) {
      throw new Error(`Asset ${asset.symbol || asset} not supported by ${this.type}`)
    }
    return asset
  };

}
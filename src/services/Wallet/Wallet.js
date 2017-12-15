import log from 'Utilities/log'
import { assertMethods, assertExtended } from 'Utilities/reflect'

export class Wallet {

  constructor(assetList) {
    assertExtended(this, Wallet)
    assertMethods(this, Wallet, 'send', 'getBalance', 'isSupportedAsset', 'serialize', 'deserialize', 'canDeserialize')
    this.assetList = assetList
  }

  getAsset = (symbol) => {
    const asset = this.assetList[symbol]
    if (!asset) {
      throw new Error(`Unknown asset ${symbol}`)
    }
    return asset
  };

}
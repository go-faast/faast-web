import config from 'Config'
import log from 'Utilities/log'
import { toBigNumber, toMainDenomination } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import Bitcore from 'Services/Bitcore'

import Wallet from '../Wallet'

@abstractMethod('getAddress', 'createTransaction', 'sendTransaction')
export default class BitcoinWallet extends Wallet {

  constructor(type, xpub) {
    super(type)
    assertExtended(this, BitcoinWallet)
    this.xpub = xpub
    this.setAllAssets([{
      symbol: 'BTC',
      name: 'Bitcoin',
      decimals: 8
    }])
  }

  getId = () => this.xpub;

  isAssetSupported = (assetOrSymbol) => {
    if (!assetOrSymbol) {
      return false
    }
    const asset = this.getAsset(assetOrSymbol)
    return asset && asset.symbol === 'BTC'
  };

  getBalance = (assetOrSymbol) => {
    const asset = this.getAsset(assetOrSymbol)
    if (!this.isAssetSupported(asset)) {
      console.log('unsupported', asset)
      return Promise.resolve(toBigNumber(0))
    }
    return Bitcore.discover('BTC', this.xpub, console.log)
      .then((result) => {
        console.log('result', result)
        return result.balance
      })
      .then((balance) => toMainDenomination(balance, asset.decimals))
  };

  getAllBalances = () => this.getBalance('BTC').then((balance) => ({
    BTC: balance
  }));

}

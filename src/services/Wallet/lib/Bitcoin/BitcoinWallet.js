import log from 'Utilities/log'
import { toBigNumber, toMainDenomination } from 'Utilities/convert'
import { abstractMethod, assertExtended } from 'Utilities/reflect'
import Bitcore from 'Services/Bitcore'

import Wallet from '../Wallet'

const supportedAssets = ['BTC']

@abstractMethod('createTransaction', 'sendTransaction')
export default class BitcoinWallet extends Wallet {

  constructor(type, xpub) {
    super(type)
    assertExtended(this, BitcoinWallet)
    this.xpub = xpub
  }

  isSingleAddress = () => false;

  getFreshAddress = () => this.xpub; // TODO

  getId = () => this.xpub;

  isAssetSupported = (assetOrSymbol) => supportedAssets.includes(this.getSymbol(assetOrSymbol));

  getBalance = (assetOrSymbol) => Promise.resolve(assetOrSymbol)
    .then(this.getAsset)
    .then((asset) => {
      if (!asset) {
        log.warn('unsupported', asset)
        return Promise.resolve(toBigNumber(0))
      }
      return Bitcore.discover(asset.symbol, this.xpub, log.debug)
        .then((result) => {
          log.debug('bitcore result', result)
          return result.balance
        })
        .then((balance) => toMainDenomination(balance, asset.decimals))
    });

}

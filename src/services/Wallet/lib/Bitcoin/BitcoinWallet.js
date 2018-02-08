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
    this._latestDiscoveryResults = {}
  }

  getId = () => this.xpub;

  isAssetSupported = (assetOrSymbol) => supportedAssets.includes(this.getSymbol(assetOrSymbol));

  isSingleAddress = () => false;

  _performDiscovery = (symbol) => {
    const discoveryPromise = Bitcore.discover(symbol, this.xpub)
      .then((result) => {
        log.debug(`bitcore result for ${symbol}`, result)
        this._latestDiscoveryResults[symbol] = result
        return result
      });
    this._latestDiscoveryResults[symbol] = discoveryPromise
    return discoveryPromise
  };

  _getDiscoveryResult = (symbol) => Promise.resolve(this._latestDiscoveryResults[symbol])
    .then((result) => {
      if (!result) {
        return this._performDiscovery(symbol)
      }
      return result
    });

  getFreshAddress = (assetOrSymbol, { index = 0 } = {}) => Promise.resolve(assetOrSymbol)
    .then(this.assertAssetSupported)
    .then((asset) => this._getDiscoveryResult(asset.symbol))
    .then(({ unusedAddresses }) => unusedAddresses[index]);

  getBalance = (assetOrSymbol) => Promise.resolve(assetOrSymbol)
    .then(this.getSupportedAsset)
    .then((asset) => {
      if (!asset) {
        return toBigNumber(0)
      }
      return this._performDiscovery(asset.symbol)
        .then(({ balance }) => toMainDenomination(balance, asset.decimals))
    });

}

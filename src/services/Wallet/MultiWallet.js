import log from 'Utilities/log'
import { toBigNumber } from 'Utilities/convert'

import Wallet from './Wallet'

const selectFirst = (wallets) => Promise.resolve(wallets[0])

const resolveId = (walletOrId) => typeof walletOrId !== 'string' ? walletOrId.getId() : walletOrId

export default class MultiWallet extends Wallet {

  constructor() {
    super('MultiWallet')
    this.wallets = []
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Number} Wallet index, or -1 if not found
    */
  _getWalletIndex = (walletOrId) => {
    const id = resolveId(walletOrId)
    return this.wallets.findIndex((w) => w.getId() === id)
  };

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} Wallet instance, or undefined if not found
    */
  getWallet = (walletOrId) => this.wallets[this._getWalletIndex(walletOrId)];

  hasWallet = (walletOrId) => !!this.getWallet(walletOrId);

  /**
    * @param {Object} wallet - Wallet instance
    * @return {Boolean} True if wallet was added, false if already added
    */
  addWallet = (wallet) => {
    if (this.hasWallet(wallet)) {
      return false
    }
    this.wallets.push(wallet)
    return true
  };

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} The removed wallet, or undefined if nothing removed
    */
  removeWallet = (walletOrId) => {
    const walletIndex = this._getWalletIndex(walletOrId)
    if (walletIndex >= 0) {
      return this.wallets.splice(walletIndex, 1)[0]
    }
    return undefined
  };

  _getWalletsForAsset = (assetOrSymbol) => this.wallets.filter((wallet) => wallet.isAssetSupported(assetOrSymbol));

  isAssetSupported = (assetOrSymbol) => this.wallets.some((wallet) => wallet.isAssetSupported(assetOrSymbol));

  transfer = (toAddress, amount, assetOrSymbol, selectWalletCallback = selectFirst) => {
    const walletsForAsset = this.getWalletsForAsset(assetOrSymbol)
    if (walletsForAsset.length === 0) {
      const symbol = assetOrSymbol.symbol || assetOrSymbol
      return Promise.reject(new Error(`Failed to find wallet supporting ${symbol}`))
    }
    if (walletsForAsset.length === 1) {
      selectWalletCallback = selectFirst
    }
    return selectWalletCallback(walletsForAsset).then((wallet) => wallet.transfer(toAddress, amount, assetOrSymbol))
  };

  getBalance = (assetOrSymbol) => {
    const balancePromises = this.getWalletsForAsset(assetOrSymbol)
      .map((wallet) => wallet.getBalance(assetOrSymbol))
    return Promise.all(balancePromises).then((balances) => 
      balances.reduce((a, b) => a.plus(b), toBigNumber(0)))
  };

  getAllBalances = () => {
    return Promise.all(this.wallets.map((wallet) => wallet.getAllBalances()))
      .then((walletBalances) => walletBalances.reduce((balanceEntries, b) => balanceEntries.concat(Object.entries(b)), []))
      .then((balances) => balances.reduce((result, [symbol, balance]) => ({
        ...result,
        [symbol]: (result[symbol] || toBigNumber(0)).plus(balance)
      }), {}))
  };
}
window.MultiWallet = MultiWallet

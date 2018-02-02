import uuid from 'uuid/v4'
import { toBigNumber } from 'Utilities/convert'

import Wallet from './Wallet'

const selectFirst = (wallets) => Promise.resolve(wallets[0])

const resolveId = (walletOrId) => typeof walletOrId !== 'string' ? walletOrId.getId() : walletOrId

export default class MultiWallet extends Wallet {

  static type = 'MultiWallet';

  constructor(id, wallets) {
    super('MultiWallet')
    if (Array.isArray(id)) {
      wallets = id
    }
    this.id = typeof id === 'string' ? id : uuid()
    this.wallets = Array.isArray(wallets) ? wallets : []
  }

  getId = () => this.id;
  
  // TODO: remove after refactoring
  getAddress = () => this.wallets.map((wallet) => wallet.getAddress && wallet.getAddress()).join(',');

  setAssetProvider = (assetProvider) => {
    this._assetProvider = assetProvider
    this.wallets.forEach((wallet) => wallet.setAssetProvider(assetProvider))
  };

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
    wallet.setAssetProvider(this._assetProvider)
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

  getSupportedAssets = () => this.wallets.reduce((assets, wallet) => assets.concat(wallet.getSupportedAssets()), []);

  _chooseWallet = (assetOrSymbol, options) => {
    options = {
      selectWalletCallback: selectFirst,
      ...(options || {})
    }
    const walletsForAsset = this._getWalletsForAsset(assetOrSymbol)
    if (walletsForAsset.length === 0) {
      return Promise.reject(new Error(`Failed to find wallet supporting ${this.getSymbol(assetOrSymbol)}`))
    }
    if (walletsForAsset.length === 1) {
      options.selectWalletCallback = selectFirst
    }
    return options.selectWalletCallback(walletsForAsset)
  };

  transfer = (toAddress, amount, assetOrSymbol, options) => {
    return this._chooseWallet(assetOrSymbol, options).then((wallet) => wallet.transfer(toAddress, amount, assetOrSymbol, options))
  };

  createTransaction = (toAddress, amount, assetOrSymbol, options) => {
    return this._chooseWallet(assetOrSymbol, options).then((wallet) => wallet.createTransaction(toAddress, amount, assetOrSymbol, options))
  };

  sendTransaction = (tx, options) => {
    // TODO: Choose wallet based on tx.fromAddress
    return this._chooseWallet(tx.asset, options).then((wallet) => wallet.sendTransaction(tx, options))
  };

  getBalance = (assetOrSymbol) => {
    const balancePromises = this._getWalletsForAsset(assetOrSymbol)
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

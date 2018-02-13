import uuid from 'uuid/v4'
import { toBigNumber } from 'Utilities/convert'

import Wallet from './Wallet'

const selectFirst = (wallets) => wallets[0]

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
    this.setLabel(`Portfolio ${id.slice(0, 8)}`)
  }

  getId = () => this.id;

  getIconUrl = () => 'https://faa.st/img/portfolio.svg';

  getTypeLabel = () => {
    const walletCount = this.wallets.length
    if (walletCount === 0) return 'Empty'
    if (walletCount === 1) return '1 wallet'
    return `${walletCount} wallets`
  };

  isSingleAddress = () => false;

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

  isAssetSupported = (assetOrSymbol) => this.wallets.some((wallet) => wallet.isAssetSupported(assetOrSymbol));

  _chooseWallet = (assetOrSymbol, options, applyToWallet) => {
    options = {
      selectWalletCallback: selectFirst,
      ...(options || {})
    }
    const walletsForAsset = this._getWalletsForAsset(assetOrSymbol)
    if (walletsForAsset.length === 0) {
      throw new Error(`Failed to find wallet supporting ${this.getSymbol(assetOrSymbol)}`)
    }
    let selectedWallet
    if (walletsForAsset.length === 1) {
      selectedWallet = walletsForAsset[0]
    } else {
      selectedWallet = options.selectWalletCallback(walletsForAsset)
    }
    if (selectedWallet && typeof selectedWallet.then === 'function') {
      return selectedWallet.then(applyToWallet)
    }
    return applyToWallet(selectedWallet)
  };
  
  getFreshAddress = (assetOrSymbol, options = {}) => {
    if (!assetOrSymbol) {
      return null
    }
    return this._chooseWallet(assetOrSymbol, options, (wallet) => wallet.getFreshAddress(assetOrSymbol, options))
  };

  transfer = (toAddress, amount, assetOrSymbol, options = {}) => {
    return this._chooseWallet(assetOrSymbol, options, (wallet) => wallet.transfer(toAddress, amount, assetOrSymbol, options))
  };

  createTransaction = (toAddress, amount, assetOrSymbol, options = {}) => {
    return this._chooseWallet(assetOrSymbol, options, (wallet) => wallet.createTransaction(toAddress, amount, assetOrSymbol, options))
  };

  sendTransaction = (tx, options = {}) => {
    // TODO: Choose wallet based on tx.fromAddress
    return this._chooseWallet(tx.asset, options, (wallet) => wallet.sendTransaction(tx, options))
  };

  getBalance = (assetOrSymbol, options = {}) => {
    const balancePromises = this._getWalletsForAsset(assetOrSymbol)
      .map((wallet) => wallet.getBalance(assetOrSymbol, options))
    return Promise.all(balancePromises).then((balances) => 
      balances.reduce((a, b) => a.plus(b), toBigNumber(0)))
  };

  getAllBalances = (options = {}) => {
    return Promise.all(this.wallets.map((wallet) => wallet.getAllBalances(options)))
      .then((walletBalances) => walletBalances.reduce((balanceEntries, b) => balanceEntries.concat(Object.entries(b)), []))
      .then((balances) => balances.reduce((result, [symbol, balance]) => ({
        ...result,
        [symbol]: (result[symbol] || toBigNumber(0)).plus(balance)
      }), {}))
  };
}
window.MultiWallet = MultiWallet

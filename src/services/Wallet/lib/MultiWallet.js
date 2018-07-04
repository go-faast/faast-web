import uuid from 'uuid/v4'
import { toBigNumber } from 'Utilities/convert'
import { reduceByKey } from 'Utilities/helpers'

import Wallet from './Wallet'

const selectFirst = (wallets) => wallets[0]

const resolveId = (walletOrId) => walletOrId instanceof Wallet ? walletOrId.getId() : walletOrId

const ZERO = toBigNumber(0)

const plus = (x, y) => x.plus(y)

export default class MultiWallet extends Wallet {

  static type = 'MultiWallet';

  constructor(id, wallets, label) {
    super(label)
    if (Array.isArray(id)) {
      wallets = id
    }
    this.id = typeof id === 'string' ? id : uuid()
    this.wallets = Array.isArray(wallets) ? wallets : []
  }

  getId() { return this.id }

  getType() { return MultiWallet.type }

  getTypeLabel() {
    const walletCount = this.wallets.length
    if (walletCount === 0) return 'Empty'
    if (walletCount === 1) return '1 wallet'
    return `${walletCount} wallets`
  }

  getLabel() { return this.label || `Portfolio ${this.id.slice(0, 8)}` }

  isSingleAddress() { return false }

  setAssetProvider(assetProvider) {
    this._assetProvider = assetProvider
    this.wallets.forEach((wallet) => wallet.setAssetProvider(assetProvider))
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Number} Wallet index, or -1 if not found
    */
  _getWalletIndex(walletOrId) {
    const id = resolveId(walletOrId)
    return this.wallets.findIndex((w) => w.getId() === id)
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} Wallet instance, or undefined if not found
    */
  getWallet(walletOrId) { return this.wallets[this._getWalletIndex(walletOrId)] }

  hasWallet(walletOrId) { return Boolean(this.getWallet(walletOrId)) }

  /**
    * @param {Object} wallet - Wallet instance
    * @return {Boolean} True if wallet was added, false if already added
    */
  addWallet(wallet) {
    if (this.hasWallet(wallet)) {
      return false
    }
    this.wallets.push(wallet)
    wallet.setAssetProvider(this._assetProvider)
    return true
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} The removed wallet, or undefined if nothing removed
    */
  removeWallet(walletOrId) {
    const walletIndex = this._getWalletIndex(walletOrId)
    if (walletIndex >= 0) {
      return this.wallets.splice(walletIndex, 1)[0]
    }
    return undefined
  }

  _getWalletsForAsset(assetOrSymbol) { return this.wallets.filter((wallet) => wallet.isAssetSupported(assetOrSymbol)) }

  isAssetSupported(assetOrSymbol) { return this.wallets.some((wallet) => wallet.isAssetSupported(assetOrSymbol)) }

  _chooseWallet(assetOrSymbol, options, applyToWallet) {
    return Promise.resolve().then(() => {
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
    })
  }
  
  getFreshAddress(assetOrSymbol, options = {}) {
    return Promise.resolve().then(() => {
      if (!assetOrSymbol) {
        return null
      }
      return this._chooseWallet(
        assetOrSymbol,
        options,
        (wallet) => wallet.getFreshAddress(assetOrSymbol, options))
    })
  }

  createTransaction(toAddress, amount, assetOrSymbol, options = {}) {
    return this._chooseWallet(
      assetOrSymbol,
      options,
      (wallet) => wallet.createTransaction(toAddress, amount, assetOrSymbol, options))
  }

  _validateTx(tx) {
    if (tx === null || typeof tx !== 'object') {
      throw new Error(`Invalid tx of type ${typeof tx}`)
    }
    const wallet = this.getWallet(tx.walletId)
    if (!wallet) {
      throw new Error(`Invalid tx provided to ${this.getType()} ${this.getId()} with invalid walletId ${tx.walletId}`)
    }
    return tx
  }

  _callWalletTxFn(fnName, tx, options) {
    return Promise.resolve().then(() => {
      const wallet = this.getWallet(tx.walletId)
      return wallet[fnName](tx, options)
    })
  }

  _signTx(tx, options) {
    return this._callWalletTxFn('_signTx', tx, options)
  }

  _sendSignedTx(tx, options) {
    return this._callWalletTxFn('_sendSignedTx', tx, options)
  }

  getTransactionReceipt(tx) {
    return this._callWalletTxFn('getTransactionReceipt', tx)
  }

  getBalance(assetOrSymbol, options = {}) {
    const balancePromises = this._getWalletsForAsset(assetOrSymbol)
      .map((wallet) => wallet.getBalance(assetOrSymbol, options))
    return Promise.all(balancePromises).then((balances) => balances.reduce(plus, ZERO))
  }

  getAllBalances(options = {}) {
    return Promise.all(this.wallets.map((wallet) => wallet.getAllBalances(options)))
      .then((walletBalances) => reduceByKey(walletBalances, plus, ZERO))
  }
}

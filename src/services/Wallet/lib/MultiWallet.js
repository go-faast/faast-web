import uuid from 'uuid/v4'
import { toBigNumber } from 'Utilities/convert'
import { reduceByKey, toHashId } from 'Utilities/helpers'

import Wallet from './Wallet'

const selectFirst = (wallets) => wallets[0]

const resolveId = (walletOrId) => walletOrId instanceof Wallet ? walletOrId.getId() : walletOrId

const ZERO = toBigNumber(0)

const plus = (x, y) => x.plus(y)

const isList = (x) => Array.isArray(x) || x instanceof Set

export default class MultiWallet extends Wallet {

  static type = 'MultiWallet';

  constructor(id, walletIds, label) {
    if (isList(id)) {
      label = walletIds
      walletIds = id
    }
    id = typeof id === 'string' ? id : toHashId(uuid())
    super(id, label)
    this.walletIds = new Set(isList(walletIds) ? walletIds : [])
  }

  getType() { return MultiWallet.type }

  getTypeLabel() {
    const walletCount = this.walletIds.size
    if (walletCount === 0) return 'Empty'
    if (walletCount === 1) return '1 wallet'
    return `${walletCount} wallets`
  }

  getLabel() { return this.label || `Portfolio ${this.id.slice(0, 8)}` }

  isSingleAddress() { return false }

  hasWallet(walletOrId) {
    return this.walletIds.has(resolveId(walletOrId))
  }

  getWallets() {
    return Array.from(this.walletIds).map(::this._walletGetter).filter((x) => x != null)
  }

  getWalletIds() {
    return this.getWallets().map((w) => w.getId())
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} Wallet instance, or undefined if not found
    */
  getWallet(walletOrId) {
    return this.hasWallet(walletOrId) ? this._walletGetter(resolveId(walletOrId)) : undefined
  }

  /**
    * @param {Object} wallet - Wallet instance
    * @return {Boolean} True if wallet was added, false if already added
    */
  addWallet(wallet) {
    if (this.hasWallet(wallet)) {
      return false
    }
    this.walletIds.add(wallet.getId())
    wallet.setAssetProvider(this._assetProvider)
    wallet.setWalletGetter(this._walletGetter)
    return true
  }

  /**
    * @param {(Object|String)} walletOrId - Wallet instance or wallet ID
    * @return {Object} The removed wallet, or undefined if nothing removed
    */
  removeWallet(walletOrId) {
    const removedId = resolveId(walletOrId)
    const removed = this.walletIds.delete(removedId)
    return removed ? this._walletGetter(removedId) : undefined
  }

  _getWalletsForAsset(assetOrSymbol) {
    return this.getWallets().filter((wallet) => wallet.isAssetSupported(assetOrSymbol))
  }

  isAssetSupported(assetOrSymbol) {
    return this.getWallets().some((wallet) => wallet.isAssetSupported(assetOrSymbol))
  }

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
    return Promise.all(this.getWallets().map((wallet) => wallet.getAllBalances(options)))
      .then((walletBalances) => reduceByKey(walletBalances, plus, ZERO))
  }
}

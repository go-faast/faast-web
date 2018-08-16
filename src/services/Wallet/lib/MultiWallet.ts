import uuid from 'uuid/v4'
import BigNumber from 'bignumber.js'
import { toBigNumber } from 'Utilities/convert'
import { reduceByKey, toHashId } from 'Utilities/helpers'

import Wallet from './Wallet'
import { Asset } from 'Types'
import {
  Transaction, Amount, Balances, FeeRate, TransactionOutput, Receipt,
} from './types'

const selectFirst = (wallets: Wallet[]) => wallets[0]

const resolveId = (walletOrId: Wallet | string) => walletOrId instanceof Wallet ? walletOrId.getId() : walletOrId

const ZERO = toBigNumber(0)

const plus = (x: BigNumber, y: BigNumber) => x.plus(y)

type Options = {
  selectWalletCallback?: (wallet: Wallet[]) => Wallet,
}

export default class MultiWallet extends Wallet {

  static type = 'MultiWallet'

  public walletIds: Set<string>

  constructor(id?: string, walletIds?: string[] | Set<string>, label?: string) {
    super(id || toHashId(uuid()), label)
    this.walletIds = new Set(walletIds || [])
  }

  getType() { return MultiWallet.type }

  getTypeLabel() {
    const walletCount = this.walletIds.size
    if (walletCount === 0) { return 'Empty' }
    if (walletCount === 1) { return '1 wallet' }
    return `${walletCount} wallets`
  }

  getLabel() { return this.label || `Portfolio ${this.id.slice(0, 8)}` }

  isSingleAddress() { return false }

  hasWallet(walletOrId: Wallet | string) {
    return this.walletIds.has(resolveId(walletOrId))
  }

  getWallets() {
    return Array.from(this.walletIds).map((id) => this._walletGetter(id)).filter((x) => x != null)
  }

  getWalletIds() {
    return this.getWallets().map((w) => w.getId())
  }

  getWallet(walletOrId: Wallet | string) {
    return this.hasWallet(walletOrId) ? this._walletGetter(resolveId(walletOrId)) : undefined
  }

  addWallet(wallet: Wallet) {
    if (this.hasWallet(wallet)) {
      return false
    }
    this.walletIds.add(wallet.getId())
    wallet.setAssetProvider(this._assetProvider)
    wallet.setWalletGetter(this._walletGetter)
    return true
  }

  removeWallet(walletOrId: Wallet | string) {
    const removedId = resolveId(walletOrId)
    const removed = this.walletIds.delete(removedId)
    return removed ? this._walletGetter(removedId) : undefined
  }

  _getWalletsForAsset(assetOrSymbol: Asset | string) {
    return this.getWallets().filter((wallet) => wallet.isAssetSupported(assetOrSymbol))
  }

  _isAssetSupported(asset: Asset) {
    return this.getWallets().some((wallet) => wallet.isAssetSupported(asset))
  }

  isAggregateTransactionSupported(assetOrSymbol: Asset | string) {
    return this.getWallets().some((wallet) => wallet.isAggregateTransactionSupported(assetOrSymbol))
  }

  _chooseWallet<T>(
    asset: Asset,
    { selectWalletCallback = selectFirst }: Options,
    applyToWallet: (wallet: Wallet) => Promise<T> | T,
  ): Promise<T | null> {
    return Promise.resolve().then(() => {
      if (!asset) {
        return null
      }
      const walletsForAsset = this._getWalletsForAsset(asset)
      if (walletsForAsset.length === 0) {
        throw new Error(`Failed to find wallet supporting ${asset.symbol}`)
      }
      let selectedWallet
      if (walletsForAsset.length === 1) {
        selectedWallet = walletsForAsset[0]
      } else {
        selectedWallet = selectWalletCallback(walletsForAsset)
      }
      if (selectedWallet instanceof Promise) {
        return selectedWallet.then(applyToWallet)
      }
      return applyToWallet(selectedWallet)
    })
  }

  _getFreshAddress(asset: Asset, options: object): Promise<string> {
    return this._chooseWallet(
      asset,
      options,
      (wallet) => wallet._getFreshAddress(asset, options))
  }

  _getDefaultFeeRate(asset: Asset, options: object): Promise<FeeRate> {
    return this._chooseWallet(
      asset,
      options,
      (wallet) => wallet._getDefaultFeeRate(asset, options))
  }

  _createTransaction(toAddress: string, amount: Amount, asset: Asset, options: object): Promise<Transaction> {
    return this._chooseWallet(
      asset,
      options,
      (wallet) => wallet._createTransaction(toAddress, amount, asset, options))
  }

  _createAggregateTransaction(
    outputs: TransactionOutput[], asset: Asset, options: object,
  ): Promise<Transaction> {
    return this._chooseWallet(
      asset,
      options,
      (wallet) => wallet._createAggregateTransaction(outputs, asset, options),
    )
  }

  _validateTx(tx: Transaction): Transaction {
    if (tx === null || typeof tx !== 'object') {
      throw new Error(`Invalid tx of type ${typeof tx}`)
    }
    const { walletId } = tx
    const validWalletId = walletId === this.getId() || this.hasWallet(walletId)
    if (!validWalletId) {
      throw new Error(`Invalid tx provided to ${this.getType()} ${this.getId()} with invalid walletId ${walletId}`)
    }
    return tx
  }

  _signTx(tx: Transaction, options: object): Promise<Partial<Transaction>> {
    return this.getWallet(tx.walletId)._signTx(tx, options)
  }

  _sendSignedTx(tx: Transaction, options: object): Promise<Partial<Transaction>> {
    return this.getWallet(tx.walletId)._sendSignedTx(tx, options)
  }

  _getTransactionReceipt(tx: Transaction, options: object): Promise<Receipt> {
    return this.getWallet(tx.walletId)._getTransactionReceipt(tx, options)
  }

  _getBalance(asset: Asset, options: object): Promise<Amount> {
    const balancePromises = this._getWalletsForAsset(asset)
      .map((wallet) => wallet._getBalance(asset, options))
    return Promise.all(balancePromises).then((balances) => balances.reduce(plus, ZERO))
  }

  getAllBalances(options: object): Promise<Balances> {
    return Promise.all(this.getWallets().map((wallet) => wallet.getAllBalances(options)))
      .then((walletBalances) => reduceByKey(walletBalances, plus, ZERO))
  }
}

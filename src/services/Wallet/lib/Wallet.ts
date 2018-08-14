import { BigNumber, ZERO } from 'Utilities/convert'
import log from 'Utilities/log'

import {
  Asset, Transaction, TransactionOutput, Receipt,
  Amount, Balances, FeeRate, AssetProvider, WalletGetter,
} from './types'

export default abstract class Wallet {

  constructor(public id: string, public label?: string) {}

  _persistAllowed: boolean = true
  _assetProvider: AssetProvider = () => []
  _walletGetter: WalletGetter = () => null

  /** The type of this wallet. Generally the class name should is used. */
  abstract getType(): string

  /** A user friendly label for this type of wallet. (e.g. MetaMask, TREZOR) */
  abstract getTypeLabel(): string

  /** Return true if the asset is supported */
  abstract isAssetSupported(asset: Asset | string): boolean

  /** Return true if only one address used (e.g. Ethereum), false multiple (e.g. Bitcoin) */
  abstract isSingleAddress(): boolean

  abstract _getFreshAddress(asset: Asset, options: object): Promise<string>
  abstract _getBalance(asset: Asset, options: object): Promise<Amount>
  abstract _createTransaction(
    address: string, amount: Amount, asset: Asset, options: object,
  ): Promise<Partial<Transaction>>
  abstract _signTx(tx: Transaction, options: object): Promise<Partial<Transaction>>
  abstract _sendSignedTx(tx: Transaction, options: object): Promise<Partial<Transaction>>
  abstract _getTransactionReceipt(tx: Transaction, options: object): Promise<Receipt>
  abstract _getDefaultFeeRate(asset: Asset, options: object): Promise<FeeRate>

  /** The ID of this wallet */
  getId(): string { return this.id }

  getLabel(): string { return this.label || this.getType() }
  setLabel(label: string): void { this.label = label }

  isPersistAllowed(): boolean { return this._persistAllowed }
  setPersistAllowed(persistAllowed: boolean): void { this._persistAllowed = persistAllowed }

  /* The following methods return default values and can be overriden by subclass where applicable */
  isReadOnly(): boolean { return false }
  isPasswordProtected(): boolean { return false }
  checkPasswordCorrect(password: string): boolean { return true }
  isSignTransactionSupported(): boolean { return true }
  isAggregateTransactionSupported(aos: Asset | string): boolean { return false }

  setAssetProvider(assetProvider: AssetProvider): void {
    if (typeof assetProvider !== 'function') {
      throw new Error(`Expected assetProvider to be a function, got ${typeof assetProvider}`)
    }
    this._assetProvider = assetProvider
  }

  setWalletGetter(walletGetter: WalletGetter): void {
    if (typeof walletGetter !== 'function') {
      throw new Error(`Expected walletGetter to be a function, got ${typeof walletGetter}`)
    }
    this._walletGetter = walletGetter
  }

  getAllAssets(): Asset[] {
    const assets = this._assetProvider()
    if (typeof assets === 'object') {
      return Object.values(assets)
    }
    return assets || []
  }

  getAllAssetsBySymbol() {
    const assets = this._assetProvider()
    if (Array.isArray(assets)) {
      return assets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    return assets || {}
  }

  getSymbol(aos: Asset | string): string {
    if (typeof aos === 'string') {
      return aos
    }
    return aos.symbol
  }

  getAsset(aos: Asset | string): Asset {
    return this.getAllAssetsBySymbol()[this.getSymbol(aos)]
  }

  getSupportedAssets(): Asset[] {
    return this.getAllAssets().filter(this.isAssetSupported.bind(this))
  }

  getSupportedstrings(): string[] {
    return this.getSupportedAssets().map(({ symbol }) => symbol)
  }

  getSupportedAssetsBySymbol(): { [symbol: string]: Asset } {
    return this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }), {})
  }

  getSupportedAsset(aos: Asset | string): Asset {
    const asset = this.getAsset(aos)
    return (asset && this.isAssetSupported(asset)) ? asset : null
  }

  assertAssetSupported(aos: Asset | string): Asset {
    const asset = this.getSupportedAsset(aos)
    if (!asset) {
      throw new Error(`Asset ${this.getSymbol(aos)} not supported by ${this.getType()}`)
    }
    return asset
  }

  /** Default behaviour, should be overriden in subclass if applicable */
  canSendAsset(aos: Asset | string) {
    const asset = this.getSupportedAsset(aos)
    return asset && !this.isReadOnly()
  }

  getUnsendableAssets(): Asset[] {
    return this.getSupportedAssets().filter((asset) => !this.canSendAsset(asset))
  }

  getUnsendablestrings(): string[] {
    return this.getUnsendableAssets().map(({ symbol }) => symbol)
  }

  /** Get a fresh address for the provided asset */
  getFreshAddress(aos: Asset | string, options: object = {}): Promise<string> {
    return this._getFreshAddress(this.assertAssetSupported(aos), options)
  }

  getDefaultFeeRate(aos: Asset | string, options: object = {}): Promise<FeeRate> {
    return Promise.resolve().then(() => {
      const asset = this.assertAssetSupported(aos)
      return this._getDefaultFeeRate(asset, options)
    })
  }

  getBalance(aos: Asset | string, options: object = {}): Promise<Amount> {
    return Promise.resolve().then(() => {
      const asset = this.getSupportedAsset(aos)
      if (asset) {
        return this._getBalance(asset, options)
      }
      return ZERO
    })
  }

  createTransaction(
    address: string, amount: Amount, aos: Asset | string, options: object = {},
  ): Promise<Transaction> {
    return Promise.resolve().then(() => {
      const asset = this.assertAssetSupported(aos)
      return this._createTransaction(address, amount, asset, options)
        .then((result) => log.debugInline(
          'createTransaction',
          this._newTransaction(asset, [{ address, amount }], result),
        ))
    })
  }

  createAggregateTransaction(
    outputs: TransactionOutput[],
    aos: Asset | string,
    options: object = {},
  ): Promise<Transaction> {
    return Promise.resolve().then(() => {
      const asset = this.assertAssetSupported(aos)
      this._assertAggregateTransactionSupported(asset)
      return this._createAggregateTransaction(outputs, asset, options)
        .then((result) => log.debugInline(
          'createAggregateTransaction',
          this._newTransaction(asset, outputs, result),
        ))
    })
  }

  signTransaction(tx: Transaction, options: object = {}): Promise<Transaction> {
    return Promise.resolve().then(() => {
      this._validateTx(tx)
      this._assertSignTransactionSupported()
      return this._signTx(tx, options)
    }).then((result) => log.debugInline('signTransaction', ({
      ...tx,
      ...result,
      signed: true,
    })))
  }

  sendTransaction(tx: Transaction, options: object = {}): Promise<Transaction> {
    return Promise.resolve().then(() => {
      this._validateTx(tx)
      return tx.signed
        ? this._sendSignedTx(tx, options)
        : this._signAndSendTx(tx, options)
    }).then((result) => log.debugInline('sendTransaction', ({
      ...tx,
      ...result,
      signed: true,
      sent: true,
    })))
  }

  getTransactionReceipt(tx: Transaction, options: object = {}): Promise<object> {
    return Promise.resolve().then(() => {
      this._validateTx(tx)
      return tx.hash ? this._getTransactionReceipt(tx, options) : null
    }).then((result) => log.debugInline('getTransactionReceipt', result))
  }

  send(address: string, amount: Amount, aos: Asset | string, options: object = {}): Promise<Transaction> {
    return this.createTransaction(address, amount, aos, options)
      .then((tx) => this.sendTransaction(tx, options))
  }

  getAllBalances(options: object = {}): Promise<Balances> {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => Promise.all(assets
        .map((asset) => this._getBalance(asset, options)
          .then((balance) => ({ symbol: asset.symbol, balance })))))
      .then((balances) => balances.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance,
      }), {}))
  }

  toJSON(): object {
    return Object.assign({
      type: this.getType(),
    }, this)
  }

  /** Unsupported by default, can be overriden in subclass */
  _createAggregateTransaction(
    outputs: TransactionOutput[],
    asset: Asset,
    options: object = {},
  ): Promise<Partial<Transaction>> {
    throw new Error('Unsupported method _createAggregateTransaction')
  }

  _signAndSendTx(tx: Transaction, options: object): Promise<Partial<Transaction>> {
    return this._signTx(tx, options)
      .then((signedTx) => this._sendSignedTx({ ...tx, ...signedTx }, options))
  }

  /** Default does nothing, should be overridden in subclass */
  _validateTxData(txData: any): any {
    return txData
  }

  /** Default does nothing, should be overridden in subclass */
  _validateSignedTxData(signedTxData: any): any {
    return signedTxData
  }

  _validateTx(tx: Transaction): Transaction {
    if (tx === null || typeof tx !== 'object') {
      log.error('invalid tx', tx)
      throw new Error(`Invalid tx of type ${typeof tx}`)
    }
    if (tx.walletId !== this.getId()) {
      log.error('invalid tx', tx)
      throw new Error(`Invalid tx provided to wallet ${this.getId()} with mismatched walletId ${tx.walletId}`)
    }
    this._validateTxData(tx.txData)
    if (tx.signed && this.isSignTransactionSupported()) {
      this._validateSignedTxData(tx.signedTxData)
    }
    return tx
  }

  _assertSignTransactionSupported(): void {
    if (!this.isSignTransactionSupported()) {
      throw new Error(`Wallet ${this.getId()} does not support signTransaction`)
    }
  }

  _assertAggregateTransactionSupported(aos: Asset | string): Asset | string {
    if (!this.isAggregateTransactionSupported(aos)) {
      throw new Error(`Wallet ${this.getId()} does not support createAggregateTransaction`)
    }
    return aos
  }

  _newTransaction(asset: Asset, outputs: TransactionOutput[], result: object): Transaction {
    return {
      walletId: this.getId(),
      type: this.getType(),
      outputs,
      assetSymbol: asset.symbol,
      hash: null,
      signed: false,
      sent: false,
      txData: null,
      signedTxData: null,
      ...result,
    }
  }

}

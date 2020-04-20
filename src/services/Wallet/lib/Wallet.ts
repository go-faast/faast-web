import { BigNumber, ZERO } from 'Utilities/convert'
import log from 'Utilities/log'

import { Asset } from 'Types'
import {
  Transaction, TransactionOutput, Receipt, AddressFormatOption,
  Amount, Balances, FeeRate, AssetProvider, WalletGetter,
} from './types'
import { AddressFormat, DEFAULT_FORMAT as DEFAULT_ADDRESS_FORMAT } from 'Utilities/addressFormat'

export default abstract class Wallet {

  constructor(public id: string, public label?: string, public xpub?: string) {}

  _persistAllowed: boolean = true
  _assetProvider: AssetProvider = () => []
  _walletGetter: WalletGetter = () => null

  /** The ID of this wallet */
  getId(): string { return this.id }

  getXpub(): string { return this.xpub }

  getLabel(): string { return this.label || this.getType() }
  setLabel(label: string): void { this.label = label }

  /** Return true if this wallet can be saved to session storage */
  isPersistAllowed(): boolean { return this._persistAllowed }
  setPersistAllowed(persistAllowed: boolean): void { this._persistAllowed = persistAllowed }

  /** Return true if this wallet does not support sending transactions, only reading balances. */
  isReadOnly(): boolean { return false }
  /** Return true if this wallet requires a password when signing transactions */
  isPasswordProtected(): boolean { return false }
  /** Return true if the provided password is correct */
  checkPasswordCorrect(password: string): boolean { return true }
  /** Return true if this wallet supports the signTx method. If false, signAndSend transaction must be used instead. */
  isSignTransactionSupported(): boolean { return true }
  /** Return true if this wallet supports transactions with multiple outputs (e.g. anything UTXO based, like Bitcoin) */
  _isAggregateTransactionSupported(aos: Asset): boolean { return true }

  /** The type of this wallet. Generally the class name should is used. */
  abstract getType(): string

  /** A user friendly label for this type of wallet. (e.g. MetaMask, TREZOR) */
  abstract getTypeLabel(): string

  /** Return true if only one address used (e.g. Ethereum), false multiple (e.g. Bitcoin) */
  abstract isSingleAddress(): boolean

  /** Return true if the asset is supported */
  abstract _isAssetSupported(asset: Asset): boolean

  /** Return a list of all addresses used by this wallet */
  abstract _getUsedAddresses(options: AddressFormatOption): Promise<string[]>

  /** Return a fresh address for the provided asset */
  abstract _getFreshAddress(asset: Asset, options: AddressFormatOption): Promise<string>

  /** Return the balance for the provided asset */
  abstract _getBalance(asset: Asset, options: object): Promise<Amount>

  /** Create a new transaction that can be passed into signTx or signAndSendTx */
  abstract _createTransaction(
    address: string, amount: Amount, asset: Asset, options: object,
  ): Promise<Transaction>

  /** Sign the provided transaction. Returns the fields to update in the original transaction. */
  abstract _signTx(tx: Transaction, options: object): Promise<Partial<Transaction>>

  /** Send the provided transaction. Returns the fields to update in the original transaction. */
  abstract _sendSignedTx(tx: Transaction, options: object): Promise<Partial<Transaction>>

  /** Get the receipt for the provided transaction. */
  abstract _getTransactionReceipt(tx: Transaction, options: object): Promise<Receipt>

  /** Get the default fee rate */
  abstract _getDefaultFeeRate(asset: Asset, options: object): Promise<FeeRate>

  /** Create a new transaction with multiple outputs */
  abstract _createAggregateTransaction(
    outputs: TransactionOutput[],
    asset: Asset,
    options: object,
  ): Promise<Transaction>

  /** Return the default address format */
  _getDefaultAddressFormat(): AddressFormat {
    return DEFAULT_ADDRESS_FORMAT
  }

  /** Return the supported address formats */
  _getAddressFormats(): AddressFormat[] {
    return [this._getDefaultAddressFormat()]
  }

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

  getAllAssetsBySymbol(): { [symbol: string]: Asset } {
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
    if (typeof aos === 'string') {
      return this.getAllAssetsBySymbol()[aos]
    }
    return aos
  }

  isAssetSupported(aos: Asset | string): boolean {
    return this._isAssetSupported(this.getAsset(aos))
  }

  getSupportedAssets(): Asset[] {
    return this.getAllAssets().filter((a) => this._isAssetSupported(a))
  }

  getTop10SupportedAssets(): Asset[] {
    return this.getAllAssets().filter((a) => this._isAssetSupported(a))
      .sort((a, b) => b.marketCap.comparedTo(a.marketCap))
      .slice(0, 10)
  }

  getSupportedAssetSymbols(): string[] {
    return this.getSupportedAssets().map(({ symbol }) => symbol)
  }

  getSupportedAssetsBySymbol(): { [symbol: string]: Asset } {
    return this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }), {})
  }

  getSupportedAsset(aos: Asset | string): Asset {
    const asset = this.getAsset(aos)
    return (asset && this._isAssetSupported(asset)) ? asset : null
  }

  assertAssetSupported(aos: Asset | string): Asset {
    const asset = this.getSupportedAsset(aos)
    if (!asset) {
      throw new Error(`Asset ${this.getSymbol(aos)} not supported by ${this.getType()}`)
    }
    return asset
  }

  /** Default behaviour, should be overriden in subclass if applicable */
  canSendAsset(aos: Asset | string): boolean {
    const asset = this.getSupportedAsset(aos)
    return asset && !this.isReadOnly()
  }

  getUnsendableAssets(): Asset[] {
    return this.getSupportedAssets().filter((asset) => !this.canSendAsset(asset))
  }

  getUnsendableAssetSymbols(): string[] {
    return this.getUnsendableAssets().map(({ symbol }) => symbol)
  }

  _getAddressFormat(formatOrType: AddressFormat | string): AddressFormat {
    let type = formatOrType
    if (typeof formatOrType !== 'string') {
      type = formatOrType.type
    }
    const format = this._getAddressFormats().find((f) => f.type === type)
    if (!format) {
      throw new Error(`${this.getType()}: Unsupported address format ${formatOrType}`)
    }
    return format
  }

  _resolveAddressFormatOption(options: AddressFormatOption = {}): AddressFormat {
    const { addressFormat: formatOption } = options
    if (formatOption) {
      return this._getAddressFormat(formatOption)
    }
    return this._getDefaultAddressFormat()
  }

  /** Return true if the address is in the specified format */
  isAddressFormat(address: string, formatOrType: AddressFormat | string): boolean {
    return this._getAddressFormat(formatOrType).test(address)
  }

  /** Convert the address to the specified format */
  toAddressFormat(address: string, formatOrType: AddressFormat | string): string {
    return this._getAddressFormat(formatOrType).convert(address)
  }

  getDefaultAddressFormat(): AddressFormat {
    return this._getDefaultAddressFormat()
  }

  getAddressFormats(): AddressFormat[] {
    return this._getAddressFormats()
  }

  getUsedAddresses(options: AddressFormatOption = {}): Promise<string[]> {
    return Promise.resolve().then(() => {
      const format = this._resolveAddressFormatOption(options)
      return this._getUsedAddresses(options)
        .then((addresses) => addresses.map(format.convert))
    })
  }

  /** Get a fresh address for the provided asset */
  getFreshAddress(aos: Asset | string, options: AddressFormatOption = {}): Promise<string> {
    return Promise.resolve().then(() => {
      const format = this._resolveAddressFormatOption(options)
      return this._getFreshAddress(this.assertAssetSupported(aos), options)
        .then(format.convert)
    })
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
    address: string, amount: Amount, aos: Asset | string, options: {
      extraId?: string,
    },
  ): Promise<Transaction> {
    return Promise.resolve().then(() => {
      const asset = this.assertAssetSupported(aos)
      return this._createTransaction(address, amount, asset, options)
        .then((tx) => log.debugInline('createTransaction', tx))
    })
  }

  isAggregateTransactionSupported(aos: Asset | string) {
    return this._isAggregateTransactionSupported(this.getAsset(aos))
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
        .then((tx) => log.debugInline('createAggregateTransaction', tx))
    })
  }

  signTransaction(tx: Transaction, options: object = {}): Promise<Transaction> {
    return Promise.resolve().then(() => {
      this._validateTx(tx)
      this._assertSignTransactionSupported()
      return this._signTx(tx, options)
    }).then((result) => log.debugInline('signTransaction', ({
      ...tx,
      signed: true,
      ...result,
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
      signed: true,
      sent: true,
      ...result,
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
      .then((assets) => this.getManyBalances(assets, options))
  }

  getManyBalances(assets: Asset[], options: object = {}): Promise<Balances> {
    return Promise.all(assets
        .map((asset) => this._getBalance(asset, options)
          .then((balance) => ({ symbol: asset.symbol, balance }))))
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

  _newTransaction(
    asset: Asset,
    outputs: TransactionOutput[],
  ): Transaction {
    return {
      walletId: this.getId(),
      type: this.getType(),
      outputs,
      assetSymbol: asset.symbol,
      feeAmount: ZERO,
      feeSymbol: asset.symbol,
      hash: null,
      signed: false,
      sent: false,
      txData: null,
      signedTxData: null,
    }
  }

}

// @ts-ignore
import { BigNumber, ZERO } from 'Utilities/convert'
// @ts-ignore
import log from 'Utilities/log'

type AssetSymbol = string

interface Asset {
  symbol: AssetSymbol
}

type AssetOrSymbol = Asset | AssetSymbol

interface Transaction {
  walletId: string
  type: string
  outputs: TransactionOutput[]
  assetSymbol: AssetSymbol
  hash: string | null
  signed: boolean
  sent: boolean
  txData: object | null
  signedTxData: any
}

interface TransactionOutput {
  address: string,
  amount: BigNumber,
}

type Balance = BigNumber

interface Balances {
  [symbol: string]: Balance,
}

interface FeeRate {
  rate: BigNumber | number
  unit: string
}

type AssetProvider = () => Asset[] | { [symbol: string]: Asset }
type WalletGetter = (id: string) => Wallet | null

function isAssetSymbol(aos: AssetOrSymbol): aos is AssetSymbol {
  return typeof aos === 'string'
}

export default abstract class Wallet {

  constructor(public id: string, public label: string) {}

  protected _persistAllowed: boolean = true
  protected _assetProvider: AssetProvider = () => []
  protected _walletGetter: WalletGetter = () => null

  /** The type of this wallet. Generally the class name should is used. */
  public abstract getType(): string

  /** A user friendly label for this type of wallet. (e.g. MetaMask, TREZOR) */
  public abstract getTypeLabel(): string

  /** Get a fresh address for the provided asset */
  public abstract getFreshAddress(asset: AssetOrSymbol): string

  /** Return true if the asset is supported */
  public abstract isAssetSupported(asset: AssetOrSymbol): boolean

  /** Return true if only one address used (e.g. Ethereum), false multiple (e.g. Bitcoin) */
  public abstract isSingleAddress(): boolean

  protected abstract _getBalance(asset: Asset, options?: object): Promise<Balance>
  protected abstract _createTransaction(
    address: string, amount: BigNumber, asset: Asset, options?: object,
  ): Promise<Transaction>
  protected abstract _signTx(tx: Transaction, options?: object): Promise<Transaction>
  protected abstract _sendSignedTx(tx: Transaction, options?: object): Promise<Transaction>
  protected abstract _getTransactionReceipt(txHash: string, options?: object): Promise<object>
  protected abstract _getDefaultFeeRate(asset: Asset, options?: object): Promise<FeeRate>

  /** The ID of this wallet */
  public getId(): string { return this.id }

  public getLabel(): string { return this.label || this.getType() }
  public setLabel(label: string): void { this.label = label }

  public isPersistAllowed(): boolean { return this._persistAllowed }
  public setPersistAllowed(persistAllowed: boolean): void { this._persistAllowed = persistAllowed }

  /* The following methods return default values and can be overriden by subclass where applicable */
  public isReadOnly(): boolean { return false }
  public isPasswordProtected(): boolean { return false }
  public checkPasswordCorrect(): boolean { return true }
  public isSignTransactionSupported(): boolean { return true }
  public isAggregateTransactionSupported(aos: AssetOrSymbol): boolean { return false }

  public setAssetProvider(assetProvider: AssetProvider): void {
    if (typeof assetProvider !== 'function') {
      throw new Error(`Expected assetProvider to be a function, got ${typeof assetProvider}`)
    }
    this._assetProvider = assetProvider
  }

  public setWalletGetter(walletGetter: WalletGetter): void {
    if (typeof walletGetter !== 'function') {
      throw new Error(`Expected walletGetter to be a function, got ${typeof walletGetter}`)
    }
    this._walletGetter = walletGetter
  }

  public getAllAssets(): Asset[] {
    const assets = this._assetProvider()
    if (typeof assets === 'object') {
      return Object.values(assets)
    }
    return assets || []
  }

  public getAllAssetsBySymbol() {
    const assets = this._assetProvider()
    if (Array.isArray(assets)) {
      return assets.reduce((mapped, asset) => ({ ...mapped, [asset.symbol]: asset }), {})
    }
    return assets || {}
  }

  public getSymbol(aos: AssetOrSymbol): AssetSymbol {
    if (isAssetSymbol(aos)) {
      return aos
    }
    return aos.symbol
  }

  public getAsset(aos: AssetOrSymbol): Asset {
    return this.getAllAssetsBySymbol()[this.getSymbol(aos)]
  }

  public getSupportedAssets(): Asset[] {
    return this.getAllAssets().filter(this.isAssetSupported.bind(this))
  }

  public getSupportedAssetSymbols(): AssetSymbol[] {
    return this.getSupportedAssets().map(({ symbol }) => symbol)
  }

  public getSupportedAssetsBySymbol(): { [symbol: string]: Asset } {
    return this.getSupportedAssets().reduce((bySymbol, asset) => ({ ...bySymbol, [asset.symbol]: asset }), {})
  }

  public getSupportedAsset(aos: AssetOrSymbol): Asset {
    const asset = this.getAsset(aos)
    return (asset && this.isAssetSupported(asset)) ? asset : null
  }

  public assertAssetSupported(aos: AssetOrSymbol): Asset {
    const asset = this.getSupportedAsset(aos)
    if (!asset) {
      throw new Error(`Asset ${this.getSymbol(aos)} not supported by ${this.getType()}`)
    }
    return asset
  }

  /** Default behaviour, should be overriden in subclass if applicable */
  public canSendAsset(aos: AssetOrSymbol) {
    const asset = this.getSupportedAsset(aos)
    return asset && !this.isReadOnly()
  }

  public getUnsendableAssets(): Asset[] {
    return this.getSupportedAssets().filter((asset) => !this.canSendAsset(asset))
  }

  public getUnsendableAssetSymbols(): AssetSymbol[] {
    return this.getUnsendableAssets().map(({ symbol }) => symbol)
  }

  public getDefaultFeeRate(aos: AssetOrSymbol, options: object = {}): Promise<FeeRate> {
    return Promise.resolve().then(() => {
      const asset = this.assertAssetSupported(aos)
      return this._getDefaultFeeRate(asset, options)
    })
  }

  public getBalance(aos: AssetOrSymbol, options: object = {}): Promise<Balance> {
    return Promise.resolve().then(() => {
      const asset = this.getSupportedAsset(aos)
      if (asset) {
        return this._getBalance(asset, options)
      }
      return ZERO
    })
  }

  public createTransaction(
    address: string, amount: BigNumber, aos: AssetOrSymbol, options: object = {},
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

  public createAggregateTransaction(
    outputs: TransactionOutput[],
    aos: AssetOrSymbol,
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

  public signTransaction(tx: Transaction, options: object = {}): Promise<Transaction> {
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

  public sendTransaction(tx: Transaction, options: object = {}): Promise<Transaction> {
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

  public getTransactionReceipt(tx: Transaction): Promise<object> {
    return Promise.resolve().then(() => {
      this._validateTx(tx)
      return tx.hash ? this._getTransactionReceipt(tx.hash) : null
    }).then((result) => log.debugInline('getTransactionReceipt', result))
  }

  public send(address: string, amount: BigNumber, aos: AssetOrSymbol, options: object): Promise<Transaction> {
    return this.createTransaction(address, amount, aos, options)
      .then((tx) => this.sendTransaction(tx, options))
  }

  public getAllBalances(options: object): Promise<Balances> {
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => Promise.all(assets
        .map((asset) => this._getBalance(asset, options)
          .then((balance) => ({ symbol: asset.symbol, balance })))))
      .then((balances) => balances.reduce((result, { symbol, balance }) => ({
        ...result,
        [symbol]: balance,
      }), {}))
  }

  public toJSON(): object {
    return Object.assign({
      type: this.getType(),
    }, this)
  }

  /** Unsupported by default, can be overriden in subclass */
  protected _createAggregateTransaction(
    outputs: TransactionOutput[],
    asset: Asset,
    options: object,
  ): Promise<Transaction> {
    throw new Error('Unsupported method _createAggregateTransaction')
  }

  protected _signAndSendTx(tx: Transaction, options: object = {}): Promise<Transaction> {
    return this._signTx(tx, options)
      .then((signedTx) => this._sendSignedTx(signedTx, options))
  }

  /** Default does nothing, should be overridden in subclass */
  protected _validateTxData<T>(txData: T): T {
    return txData
  }

  /** Default does nothing, should be overridden in subclass */
  protected _validateSignedTxData<T>(signedTxData: T): T {
    return signedTxData
  }

  protected _validateTx(tx: Transaction): Transaction {
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

  protected _assertSignTransactionSupported(): void {
    if (!this.isSignTransactionSupported()) {
      throw new Error(`Wallet ${this.getId()} does not support signTransaction`)
    }
  }

  protected _assertAggregateTransactionSupported(aos: AssetOrSymbol): AssetOrSymbol {
    if (!this.isAggregateTransactionSupported(aos)) {
      throw new Error(`Wallet ${this.getId()} does not support createAggregateTransaction`)
    }
    return aos
  }

  protected _newTransaction(asset: Asset, outputs: TransactionOutput[], result: object): Transaction {
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

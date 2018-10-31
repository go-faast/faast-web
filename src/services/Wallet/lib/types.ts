import BigNumber from 'bignumber.js'
import Wallet from './Wallet'
import { Asset } from 'Types'
import { PaymentTx } from 'Services/Bitcore'

export type Amount = BigNumber

export interface TransactionOutput {
  address: string
  amount: Amount
}

export interface Transaction {
  walletId: string
  type: string
  outputs: TransactionOutput[]
  assetSymbol: string
  feeAmount: Amount
  feeSymbol: string
  hash: string | null
  signed: boolean
  sent: boolean
  txData?: object | null
  signedTxData?: any
}

export interface BitcoreTransaction extends Transaction {
  txData?: PaymentTx | null
  signedTxData?: string | null
}

export interface Balances {
  [symbol: string]: Amount
}

export interface FeeRate {
  rate: Amount | number
  unit: string
}

export type AssetProvider = () => (Asset[] | { [symbol: string]: Asset })
export type WalletGetter = (id: string) => Wallet | null

export interface Web3Receipt {
  blockNumber: number
  status: boolean | number | string
}

export interface Receipt {
  confirmed: boolean
  succeeded: boolean
  blockNumber: number
  raw: object
}

export interface ConnectResult {
  derivationPath: string
  getAccount: (index: number) => Promise<Wallet>
}

export interface AddressFormat {
  type: string // format identifier (e.g. 'legacy', 'cashaddr', etc)
  label: string // human friendly label
  description: string // human friendly description
  test: (address: string) => boolean
  convert: (address: string) => string
}

// Used to specify address format to functions that return addresses
export interface AddressFormatOption {
  addressFormat?: AddressFormat | string // string for AddressFormat.type
}

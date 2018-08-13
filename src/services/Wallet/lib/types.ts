import Wallet from './Wallet'
import BigNumber from 'bignumber.js'

export interface Asset {
  symbol: string
}

export interface Transaction {
  walletId: string
  type: string
  outputs: TransactionOutput[]
  assetSymbol: string
  hash: string | null
  signed: boolean
  sent: boolean
  txData: object | null
  signedTxData: any
}

export type Amount = BigNumber

export interface TransactionOutput {
  address: string,
  amount: Amount,
}

export interface Balances {
  [symbol: string]: Amount,
}

export interface FeeRate {
  rate: Amount | number
  unit: string
}

export type AssetProvider = () => Asset[] | { [symbol: string]: Asset }
export type WalletGetter = (id: string) => Wallet | null

import { Tx as Web3Tx, TransactionReceipt as Web3TxReceipt } from 'web3/types'
import { BatchRequest } from 'web3/eth/types'
import { EncodedTransaction } from 'web3/types'
import EthereumjsTx from 'ethereumjs-tx'
import { Transaction, Receipt } from '../types'
import { BigNumber } from 'Src/types'

export { Web3Tx, Web3TxReceipt }

export type BatchableFn<T> = {
  (...args: any[]): Promise<T>,
  request?: (...args: any[]) => object,
}

export type SendOptions = {
  onTxHash?: (txHash: string) => void,
  onReceipt?: (receipt: Receipt) => void,
  onConfirmation?: (confirmation: number) => void,
  onError?: (error: Error) => void,
}

export type TxData = {
  to: string,
  from?: string,
  value: string | number,
  gas: string | number,
  gasPrice: string | number,
  nonce: string | number,
  data?: string,
  chainId?: number,
}

export type SignedTxData = EncodedTransaction | {
  tx: EthereumjsTx,
  raw: string,
}

export type EthTransaction = Transaction & {
  txData?: TxData | null,
  signedTxData?: SignedTxData | null,
}

export type GetBalanceOptions = {
  web3Batch?: BatchRequest,
}

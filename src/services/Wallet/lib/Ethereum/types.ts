import { TransactionReceipt as Web3TxReceipt } from 'web3/types'
import { Tx as Web3Tx } from 'web3/eth/types'
import { EncodedTransaction } from 'web3/types'
import EthereumjsTx from 'ethereumjs-tx'
import { Transaction, Receipt } from '../types'

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

export type TxData = Web3Tx & {
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

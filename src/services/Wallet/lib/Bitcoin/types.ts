import { Transaction } from '../types'
import { PaymentTx } from 'Services/Bitcore'

export type TxData = PaymentTx

export type SignedTxData = string

export type BtcTransaction = Transaction & {
  txData?: PaymentTx | null,
  signedTxData?: SignedTxData | null,
}

import { Transaction } from '../types'

export type FormattedSubmitResponse = {
  resultCode: string,
  resultMessage: string,
  engine_result: string,
  engine_result_code: number,
  engine_result_message: string,
  tx_blob: string,
  tx_json: {
    Account: string,
    Amount: {
      currency: string,
      issuer: string,
      value: number
    },
    Destination: string,
    Fee: number,
    Flags: number,
    Sequence: number,
    SigningPubKey: string,
    TransactionType: string,
    TxnSignature: string,
    hash: string
  }
}
}

export type SignedTxData = {
  serializedTx: string,
  signature: string,
}

export type FormattedSubmitResponse = {
  resultCode: string,
  resultMessage: string,
  engine_result: string,
  engine_result_code: number,
  engine_result_message: string,
  tx_blob: string,
  tx_json: {
    Account: string,
    Amount: {
      currency: string,
      issuer: string,
      value: number,
    },
    Destination: string,
    Fee: number,
    Flags: number,
    Sequence: number,
    SigningPubKey: string,
    TransactionType: string,
    TxnSignature: string,
    hash: string,
  },
}

export type XRPTransaction = Transaction & {
  txData?: TxData | null,
  signedTxData?: SignedTxData | null,
}

export type TxData = {
  txJSON: {
    TransactionType: string,
    Account: string,
    Authorize: string,
    Flags: number,
    LastLedgerSequence: number,
    DestinationTag: number,
    Fee: number,
    Sequence: number,
    SigningPubKey?: string,
    TxnSignature?: string,
  },
  instructions: {
    fee: string,
    sequence: number,
    maxLedgerVersion?: number,
  },
}

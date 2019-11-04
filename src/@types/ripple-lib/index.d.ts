import 'ripple-lib'
declare module 'ripple-lib/dist/npm/transaction' {
  export interface FormattedSubmitResponse {
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
  
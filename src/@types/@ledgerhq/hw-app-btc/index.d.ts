/// <reference types='node'/>
/// <reference types='@ledgerhq/hw-transport'/>

declare module '@ledgerhq/hw-app-btc' {
  import Transport = LedgerHQ.Transport

  export type AddressFormat = 'legacy' | 'p2sh' | 'bech32'

  export type TransactionInput = {
    prevout: Buffer,
    script: Buffer,
    sequence: Buffer,
    tree?: Buffer
  }
  
  export type TransactionOutput = {
    amount: Buffer,
    script: Buffer
  }

  export type Transaction = {
    version: Buffer,
    inputs: TransactionInput[],
    outputs?: TransactionOutput[],
    locktime?: Buffer,
    witness?: Buffer,
    timestamp?: Buffer,
    nVersionGroupId?: Buffer,
    nExpiryHeight?: Buffer,
    extraData?: Buffer
  }
  
  export default class Btc {
    constructor(transport: Transport<any>, scrambleKey?: string)
    
    hashPublicKey(buffer: Buffer)

    getWalletPublicKey(
      path: string,
      opts?:
        | boolean
        | {
            verify?: boolean,
            format?: AddressFormat
          }
    ): Promise<{
      publicKey: string,
      bitcoinAddress: string,
      chainCode: string
    }>

    getTrustedInput(
      indexLookup: number,
      transaction: Transaction,
      additionals?: Array<string>
    ): Promise<string>

    getTrustedInputBIP143(
      indexLookup: number,
      transaction: Transaction,
      additionals?: Array<string>
    ): Promise<void>

    getVarint(data: Buffer, offset: number): [number, number]

    provideOutputFullChangePath(path: string): Promise<string>

    hashOutputFull(
      outputScript: Buffer,
      additionals?: Array<string>
    ): Promise<any>

    signTransaction(
      path: string,
      lockTime?: number,
      sigHashType?: number,
      expiryHeight?: Buffer,
      additionals?: Array<string>
    ): Promise<Buffer>

    signMessageNew(
      path: string,
      messageHex: string
    ): Promise<{ v: number, r: string, s: string }>

    createPaymentTransactionNew(
      inputs: Array<[Transaction, number, string | undefined, number | undefined]>,
      associatedKeysets: string[],
      changePath?: string,
      outputScriptHex: string,
      lockTime?: number,
      sigHashType?: number,
      segwit?: boolean,
      initialTimestamp?: number,
      additionals?: Array<string>,
      expiryHeight?: Buffer
    ): Promise<any>

    signP2SHTransaction(
      inputs: Array<[Transaction, number, string | undefined, number | undefined]>,
      associatedKeysets: string[],
      outputScriptHex: string,
      lockTime?: number,
      sigHashType?: number,
      segwit?: boolean,
      transactionVersion?: number
    ): Promise<any>

    compressPublicKey(publicKey: Buffer): Buffer

    createVarint(value: number): Buffer

    splitTransaction(
      transactionHex: string,
      isSegwitSupported?: boolean,
      hasTimestamp?: boolean,
      hasExtraData?: boolean,
      additionals?: Array<string>
    ): Transaction

    serializeTransactionOutputs(tx: Transaction): Buffer

    serializeTransaction(
      transaction: Transaction,
      skipWitness: boolean,
      timestamp?: Buffer,
      additionals?: Array<string>
    ): Buffer

    displayTransactionDebug(transaction: Transaction): void
  }
}

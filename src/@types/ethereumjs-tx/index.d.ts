/// <reference types="node"/>

declare module 'ethereumjs-tx' {
  export default class EthereumTx {
    raw: Array<Buffer | number>
    r: Buffer
    s: Buffer
    v: Buffer
    nonce: Buffer
    serialize(): Buffer
    sign(buffer: Buffer): void
    getSenderAddress(): Buffer
    constructor(txParams: any)
    validate: (stringError: true) => string
    validate: (stringError?: false) => boolean
  }
}

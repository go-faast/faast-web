/// <reference types="node"/>

declare module 'ethereumjs-wallet' {
  export default class EthereumWallet {
    static generate(): EthereumWallet
    static fromPrivateKey(privateKey: Buffer): EthereumWallet
    static fromV3(keystore: object, password: string, ignoreCase?: boolean): EthereumWallet
    constructor(keystore: string | object)
    toV3(password: string, object?: encryptOptions): object
    getV3Filename(): string
    getPrivateKey(): Buffer
    getPrivateKeyString(): string
    getAddressString(): string
  }
}

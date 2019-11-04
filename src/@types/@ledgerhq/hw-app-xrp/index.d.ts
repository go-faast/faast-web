/// <reference types='node'/>
/// <reference types='@ledgerhq/hw-transport'/>

declare module '@ledgerhq/hw-app-xrp' {
  import Transport = LedgerHQ.Transport

  export default class Xrp {
    constructor(transport: Transport<any>, scrambleKey?: string)

    getAddress(
      path: string,
      boolDisplay?: boolean,
      boolChaincode?: boolean,
      ed25519?: boolean
    ): Promise<{
      publicKey: string,
      address: string,
      chainCode?: string
    }>

    signTransaction(
      path: string,
      rawTxHex: string,
      ed25519?: boolean
    ): Promise<string>

    getAppConfiguration(): Promise<{
      version: string
    }>
  }
}

/// <reference types='node'/>
/// <reference types='@ledgerhq/hw-transport'/>

declare module '@ledgerhq/hw-app-eth' {
  import Transport = LedgerHQ.Transport

  export default class Eth {
    constructor(transport: Transport<any>, scrambleKey?: string)

    getAddress(
      path: string,
      boolDisplay?: boolean,
      boolChaincode?: boolean
    ): Promise<{
      publicKey: string,
      address: string,
      chainCode?: string
    }>

    provideERC20TokenInformation({ data }: { data: Buffer }): Promise<boolean>

    signTransaction(
      path: string,
      rawTxHex: string
    ): Promise<{
      s: string,
      v: string,
      r: string
    }>

    getAppConfiguration(): Promise<{
      arbitraryDataEnabled: number,
      version: string
    }>

    signPersonalMessage(
      path: string,
      messageHex: string
    ): Promise<{
      v: number,
      s: string,
      r: string
    }>
  }
}

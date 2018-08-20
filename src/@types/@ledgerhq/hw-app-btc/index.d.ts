/// <reference types="@ledgerhq/hw-transport-u2f"/>

declare module '@ledgerhq/hw-app-btc' {
  export default class AppBtc {
    constructor(transport: TransportU2F)
    [key: string]: any
  }
}

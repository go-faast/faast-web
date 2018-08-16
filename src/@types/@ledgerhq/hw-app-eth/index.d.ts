/// <reference types="@ledgerhq/hw-transport-u2f"/>

declare module '@ledgerhq/hw-app-eth' {
  export default class AppEth {
    constructor(transport: TransportU2F)
    [key: string]: any
  }
}

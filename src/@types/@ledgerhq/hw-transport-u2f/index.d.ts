/// <reference types='@ledgerhq/hw-transport'/>

declare namespace LedgerHQ {
  export class TransportU2F extends LedgerHQ.Transport<null> {
    static create(): Promise<TransportU2F>
  }
}

declare module '@ledgerhq/hw-transport-u2f' {
  export default LedgerHQ.TransportU2F
}

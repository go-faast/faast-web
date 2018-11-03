

declare module '@ledgerhq/hw-transport-u2f' {
  export default class TransportU2F {
    static create(): Promise<TransportU2F>
    setExchangeTimeout(timeout: number): void
    setDebugMode(on: boolean): void
  }
}

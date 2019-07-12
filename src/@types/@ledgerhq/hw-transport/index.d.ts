/// <reference types='node' />
/// <reference types='@ledgerhq/errors'/>

declare namespace LedgerHQ {
  type DeviceModel = any
  type Descriptor = any

  export type Subscription = { unsubscribe: () => void };

  export type Device = Object;

  export type DescriptorEvent<Descriptor> = {
    type: "add" | "remove",
    descriptor: Descriptor,
    deviceModel?: DeviceModel,
    device?: Device
  }

  export type Observer<Ev> = Readonly<{
    next: (event: Ev) => any,
    error: (e: any) => any,
    complete: () => any
  }>

  export class Transport<D extends Descriptor> {
    static isSupported: () => Promise<boolean>
    static list: () => Promise<Array<Descriptor>>
    static listen: (
      observer: Observer<DescriptorEvent<Descriptor>>
    ) => Subscription
    static open: (
      descriptor: Descriptor,
      timeout?: number
    ) => Promise<Transport<Descriptor>>
    static create(
      openTimeout?: number,
      listenTimeout?: number
    ): Promise<Transport<Descriptor>>

    exchange: (apdu: Buffer) => Promise<Buffer>
    setScrambleKey: (key: string) => void
    close: () => Promise<void>
    on(eventName: string, cb: Function): void
    off(eventName: string, cb: Function): void
    emit(event: string, ...args: any[]): void
    setDebugMode(): void
    setExchangeTimeout(exchangeTimeout: number): void
    send: (
      cla: number,
      ins: number,
      p1: number,
      p2: number,
      data?: Buffer,
      statusList?: Array<number>
    ) => Promise<Buffer>

    exchangeTimeout: number
    exchangeBusyPromise?: Promise<void>
  }
}

declare module '@ledgerhq/hw-transport' {
  export default LedgerHQ.Transport
}

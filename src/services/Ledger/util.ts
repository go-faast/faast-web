import Transport from '@ledgerhq/hw-transport-u2f'
import AppEth from '@ledgerhq/hw-app-eth'
import AppBtc from '@ledgerhq/hw-app-btc'

export const EXCHANGE_TIMEOUT = 60000 // ms user has to approve/deny transaction

export type AppType = AppEth | AppBtc

export function createApp<A>(appType: new (t: Transport) => A): Promise<A> {
  return Transport.create().then((transport: Transport) => {
    transport.setExchangeTimeout(EXCHANGE_TIMEOUT)
    return new appType(transport)
  })
}

export function proxy<A, M extends keyof A>(appType: new (t: Transport) => A, methodName: M): A[M] {
  return ((...args: any[]) => createApp(appType).then((app) => {
    const fn = app[methodName]
    if (typeof fn !== 'function') {
      throw new Error(`Function ${methodName} is not a method of ledger ${appType.constructor.name} app`)
    }
    return fn.call(app, ...args)
  })) as any as A[M]
}

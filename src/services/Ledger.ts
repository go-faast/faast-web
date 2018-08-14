/**
 * Exports an interface for interacting with Ledger hardware wallets. Example usage:
 * import Ledger from 'Services/Ledger'
 * Ledger.eth.getAddress("m/44'/0'/0'/0")
 */

import Transport from '@ledgerhq/hw-transport-u2f'
import AppEth from '@ledgerhq/hw-app-eth'
import AppBtc from '@ledgerhq/hw-app-btc'

const EXCHANGE_TIMEOUT = 120000 // ms user has to approve/deny transaction

type AppType = AppEth | AppBtc

function createApp(appType: any): Promise<AppType> {
  return Transport.create().then((transport: Transport) => {
    transport.setExchangeTimeout(EXCHANGE_TIMEOUT)
    return new appType(transport)
  })
}

function proxy(appType: any, methodName: string) {
  return (...args: any[]) => createApp(appType).then((app) => {
    const fn = app[methodName]
    if (typeof fn !== 'function') {
      throw new Error(`Function ${methodName} is not a method of ledger ${appType.constructor.name} app`)
    }
    return fn.call(app, ...args)
  })
}

export default {
  eth: {
    getAddress: proxy(AppEth, 'getAddress'),
    signTransaction: proxy(AppEth, 'signTransaction'),
    getAppConfiguration: proxy(AppEth, 'getAppConfiguration'),
    signPersonalMessage: proxy(AppEth, 'signPersonalMessage'),
  },
  btc: {
    getWalletPublicKey: proxy(AppBtc, 'getWalletPublicKey'),
    signMessageNew: proxy(AppBtc, 'signMessageNew'),
    createPaymentTransactionNew: proxy(AppBtc, 'createPaymentTransactionNew'),
    signP2SHTransaction: proxy(AppBtc, 'signP2SHTransaction'),
    splitTransaction: proxy(AppBtc, 'splitTransaction'),
    serializeTransactionOutputs: proxy(AppBtc, 'serializeTransactionOutputs'),
    serializeTransaction: proxy(AppBtc, 'serializeTransaction'),
    displayTransactionDebug: proxy(AppBtc, 'displayTransactionDebug'),
  },
}

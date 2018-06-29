/**
  * Exports an interface for interacting with Ledger hardware wallets. Example usage:
  * import Ledger from 'Services/Ledger'
  * Ledger.eth.getAddress("m/44'/0'/0'/0")
  */

import Transport from '@ledgerhq/hw-transport-u2f'
import AppEth from '@ledgerhq/hw-app-eth'
import AppBtc from '@ledgerhq/hw-app-btc'

const serviceConfig = {
  eth: {
    App: AppEth,
    methodNames: [
      'getAddress',
      'signTransaction',
      'getAppConfiguration',
      'signPersonalMessage',
    ]
  },
  btc: {
    App: AppBtc,
    methodNames: [
      'getWalletPublicKey',
      'signMessageNew',
      'createPaymentTransactionNew',
      'signP2SHTransaction',
      'splitTransaction',
      'serializeTransactionOutputs',
      'serializeTransaction',
      'displayTransactionDebug'
    ]
  }
}

let service = null

if (window.ledger) {
  service = Object.entries(serviceConfig).reduce((apps, [appName, { App, methodNames }]) => {
    const appPromise = Transport.create().then((comm) => new App(comm))
    return {
      ...apps,
      [appName]: methodNames.reduce((methods, methodName) => ({
        ...methods,
        [methodName]: (...args) => appPromise.then((app) => {
          let fn = app[methodName]
          if (typeof fn !== 'function') {
            throw new Error(`Function ${methodName} is not a method of ledger ${appName} app`)
          }
          return fn.call(app, ...args)
        })
      }), {})
    }
  }, {})
}

export default service

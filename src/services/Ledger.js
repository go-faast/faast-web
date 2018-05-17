/**
  * Exports an interface for interacting with Ledger hardware wallets. Example usage:
  * import Ledger from 'Services/Ledger'
  * Ledger.eth.getAddress("m/44'/0'/0'/0")
  */


const serviceConfig = {
  eth: {
    App: window.ledger.eth,
    methodNames: [
      'getAddress',
      'signTransaction',
      'getAppConfiguration',
      'signPersonalMessage',
    ]
  },
  btc: {
    App: window.ledger.btc,
    methodNames: [
      'getWalletPublicKey',
      'signMessageNew',
      'createPaymentTransactionNew',
      'signP2SHTransaction',
      'splitTransaction',
      'serializeTransactionOutputs',
      'serializeTransaction',
    ]
  }
}

let service = null

if (window.ledger) {
  service = Object.entries(serviceConfig).reduce((apps, [appName, { App, methodNames }]) => {
    const appPromise = window.ledger.comm_u2f.create_async().then((comm) => new App(comm))
    return {
      ...apps,
      [appName]: methodNames.reduce((methods, methodName) => ({
        ...methods,
        [methodName]: (...args) => appPromise.then((app) => {
          let fn = app[`${methodName}_async`]
          if (typeof fn !== 'function') {
            fn = app[methodName]
          }
          return fn.call(app, ...args)
        })
      }), {})
    }
  }, {})
}

export default service

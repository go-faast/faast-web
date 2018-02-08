import log from 'Utilities/log'

function PromisifiedTrezorConnect(trezorConnectInstance) {
  const createCallback = (fnName, args, resolve, reject) => (result) => {
    if (!result || result instanceof Error) {
      return reject(result)
    }
    if (typeof result === 'object' && result.success === false) {
      log.debug(`${result.error} - TrezorConnect.${fnName}:`, args)
      return reject(new Error(result.error))
    }
    return resolve(result)
  }

  const promisify = (fnName, fn, cbIndex) => (...args) => {
    if (typeof args[cbIndex] !== 'function') {
      // Only promisify if callback hasn't already been provided
      return new Promise((resolve, reject) => 
        fn(...args.slice(0, cbIndex),
          createCallback(fnName, args, resolve, reject),
          ...args.slice(cbIndex)))
    }
    return fn(...args)
  }

  const callbackIndices = {
    open: 0,
    getXPubKey: 1,
    getFreshAddress: 0,
    getAccountInfo: 1,
    getAllAccountsInfo: 0,
    getBalance: 0,
    signTx: 2,
    signEthereumTx: 8,
    ethereumSignTx: 8,
    composeAndSignTx: 1,
    requestLogin: 3,
    signMessage: 2,
    ethereumSignMessage: 2,
    verifyMessage: 3,
    ethereumVerifyMessage: 3,
    cipherKeyValue: 6,
    nemGetAddress: 2,
    nemSignTx: 2,
    pushTransaction: 1,
    getAddress: 3,
    ethereumGetAddress: 1,
  }

  Object.entries(trezorConnectInstance).forEach(([key, val]) => {
    val = typeof val === 'function' ? val.bind(trezorConnectInstance) : val
    const cbIndex = callbackIndices[key]
    this[key] = typeof cbIndex === 'undefined' ? val : promisify(key, val, cbIndex)
  })
}

const { TrezorConnect } = window
const trezor = !TrezorConnect ? TrezorConnect : new PromisifiedTrezorConnect(TrezorConnect)

window.faast = window.faast || {}
window.faast.hw = window.faast.hw || {}
window.faast.hw.trezor = trezor
export default trezor
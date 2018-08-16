import log from 'Utilities/log'

const callbackIndices: { [fnName: string]: number } = {
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

type Result = {
  success?: boolean,
  error?: string,
}

type CallbackResult = Result | Error | null

type Callback = (result: CallbackResult) => void

type TrezorConnectType = object

declare global {
  interface Window {
    TrezorConnect?: TrezorConnectType
  }
}

export type TrezorInput = {
  address_n: number[],
  prev_hash: string,
  prev_index: number,
  amount?: number,
  script_type?: string,
}

type TrezorOutputPart = {
}

export type TrezorOutput = {
  address?: string,
  address_n?: number[],
  amount: number,
  script_type: string,
}

function createCallback(fnName: string, args: any[], resolve: (x: Result) => void, reject: (e: Error) => void) {
  return (result?: CallbackResult) => {
    if (!result) {
      return reject(new Error(`TrezorConnect.${fnName}: unknown result type ${typeof result}`))
    }
    if (result instanceof Error) {
      return reject(result)
    }
    if (typeof result === 'object' && result.success === false) {
      log.debug(`TrezorConnect.${fnName}: ${result.error}`, args)
      return reject(new Error(result.error))
    }
    return resolve(result)
  }
}

const promisify = (fnName: string, fn: (...args: any[]) => any, cbIndex: number) => (...args: any[]) => {
  if (typeof args[cbIndex] !== 'function') {
    // Only promisify if callback hasn't already been provided
    return new Promise((resolve, reject) =>
      fn(...args.slice(0, cbIndex),
        createCallback(fnName, args, resolve, reject),
        ...args.slice(cbIndex)))
  }
  return fn(...args)
}

const proxy = (tc: TrezorConnectType, key: string, val: any) => {
  val = typeof val === 'function' ? val.bind(tc) : val
  const cbIndex = callbackIndices[key]
  return typeof cbIndex === 'undefined' ? val : promisify(key, val, cbIndex)
}

class PromisifiedTrezorConnect {
  getXPubKey: (derivationPath: string) => Promise<{
    publicKey: string,
    chainCode: string,
    xpubkey: string,
    serializedPath: string,
  }>
  signEthereumTx: (
    derivationPath: string,
    nonce: string,
    gasPrice: string,
    gasLimit: string,
    to: string,
    value: string,
    data: string | null,
    chainId: number,
  ) => Promise<{ r: string, s: string, v: string}>
  signTx: (inputs: TrezorInput[], outputs: TrezorOutput[]) => Promise<{
    serialized_tx: string,
  }>

  [key: string]: (...args: any[]) => any

  constructor(tc: TrezorConnectType) {
    Object.entries(tc).forEach(([key, val]) => this[key] = proxy(tc, key, val))
  }
}

const { TrezorConnect } = window
const trezor = !TrezorConnect ? null : new PromisifiedTrezorConnect(TrezorConnect)

export default trezor

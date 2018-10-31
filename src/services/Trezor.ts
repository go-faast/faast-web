import log from 'Utilities/log'
import { NetworkConfig } from 'Utilities/networks'
import {
  convertHdKeyPrefixForPath, getHdKeyPrefix,
  derivationPathStringToArray, getPaymentTypeForPath,
} from 'Utilities/bitcoin'
import { PaymentTx } from 'Services/Bitcore'
import { HdAccount } from 'Types'

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

  getHdAccount(network: NetworkConfig, derivationPath: string | null = null): Promise<HdAccount> {
    const assetSymbol = network.symbol
    this.setCurrency(assetSymbol)
    return this.getXPubKey(derivationPath)
      .then((result) => {
        log.debug(`Trezor.getXPubKey for ${assetSymbol} success`)
        const { xpubkey, serializedPath } = result
        let normalizedPath = serializedPath
        if (!normalizedPath.startsWith('m/') && /^\d/.test(normalizedPath)) {
          normalizedPath = `m/${normalizedPath}`
        }
        const normalizedXpub = convertHdKeyPrefixForPath(xpubkey, normalizedPath, network)
        if (normalizedXpub !== xpubkey) {
          log.debug(`Converted Trezor xpubkey from ${getHdKeyPrefix(xpubkey)} to ${getHdKeyPrefix(normalizedXpub)}`)
        }
        return {
          xpub: normalizedXpub,
          path: normalizedPath,
        }
      })
  }

  signPaymentTx(
    network: NetworkConfig,
    derivationPath: string,
    txData: PaymentTx,
  ): Promise<{ signedTxData: string }> {
    return Promise.resolve().then(() => {
      const assetSymbol = network.symbol
      const { inputUtxos, outputs, change, changePath } = txData
      const baseDerivationPathArray = derivationPathStringToArray(derivationPath)
      const addressEncoding = getPaymentTypeForPath(derivationPath, network).addressEncoding
      if (!(['P2PKH', 'P2SH-P2WSH'].includes(addressEncoding))) {
        throw new Error(`Trezor.signBitcoreTx does not support ${assetSymbol} `
          + `accounts using ${addressEncoding} encoding`)
      }
      const isSegwit = addressEncoding !== 'P2PKH'
      const trezorInputs = inputUtxos.map(({ addressPath, transactionHash, index, value }) => ({
        address_n: baseDerivationPathArray.concat(addressPath),
        prev_hash: transactionHash,
        prev_index: index,
        amount: value,
        ...(isSegwit ? {
          script_type: 'SPENDP2SHWITNESS',
        } : {}),
      }))
      const trezorOutputs: TrezorOutput[] = outputs.map(({ address, amount }) => ({
        address,
        amount,
        script_type: 'PAYTOADDRESS',
      }))
      if (change > 0) {
        trezorOutputs.push({
          address_n: baseDerivationPathArray.concat(changePath),
          amount: change,
          script_type: isSegwit ? 'PAYTOP2SHWITNESS' : 'PAYTOADDRESS',
        })
      }
      log.debug('signBitcoreTx inputs outputs', trezorInputs, trezorOutputs)
      this.setCurrency(assetSymbol)
      return this.signTx(trezorInputs, trezorOutputs)
        .then((result) => {
          log.info('Trezor transaction signed', result)
          const { serialized_tx: signedTxData } = result
          return {
            signedTxData,
          }
        })
    })
  }
}

const { TrezorConnect } = window
const trezor = !TrezorConnect ? null : new PromisifiedTrezorConnect(TrezorConnect)

export default trezor

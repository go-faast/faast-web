/**
 * Exports an interface for interacting with Ledger hardware wallets. Example usage:
 * import Ledger from 'Services/Ledger'
 * Ledger.eth.getAddress("m/44'/0'/0'/0")
 */

import Transport from '@ledgerhq/hw-transport-u2f'
import AppEth from '@ledgerhq/hw-app-eth'
import AppBtc from '@ledgerhq/hw-app-btc'
import HDKey from 'hdkey'
import { NetworkConfig } from 'Utilities/networks'
import { convertHdKeyPrefixForPath, getHdKeyPrefix, joinDerivationPath } from 'Utilities/bitcoin'
import { HdAccount } from 'Types'
import log from 'Log'
import { getBitcore, PaymentTx, UtxoInfo } from 'Services/Bitcore'

const EXCHANGE_TIMEOUT = 120000 // ms user has to approve/deny transaction

type AppType = AppEth | AppBtc

function createApp(appType: any): Promise<AppType> {
  return Transport.create().then((transport: Transport) => {
    transport.setExchangeTimeout(EXCHANGE_TIMEOUT)
    transport.setDebugMode(false)
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

const proxiedBtcMethods = [
  'getWalletPublicKey',
  'signMessageNew',
  'createPaymentTransactionNew',
  'signP2SHTransaction',
  'splitTransaction',
  'serializeTransactionOutputs',
  'serializeTransaction',
  'displayTransactionDebug',
]

class LedgerBtc {

  getWalletPublicKey: (derivationPath: string) => Promise<{
    publicKey: string,
    chainCode: string,
  }>

  [key: string]: (...args: any[]) => any

  constructor() {
    proxiedBtcMethods.forEach((methodName) => this[methodName] = proxy(AppBtc, methodName))
  }

  getHdAccount(network: NetworkConfig, derivationPath: string): Promise<HdAccount> {
    return this.getWalletPublicKey(derivationPath)
      .then(({ publicKey, chainCode }) => {
        log.debug('Ledger.btc.getWalletPublicKey success')
        const hdKey = new HDKey()
        hdKey.publicKey = Buffer.from(publicKey, 'hex')
        hdKey.chainCode = Buffer.from(chainCode, 'hex')
        const xpubkey = hdKey.publicExtendedKey
        const normalizedXpub = convertHdKeyPrefixForPath(xpubkey, derivationPath, network)
        if (normalizedXpub !== xpubkey) {
          log.debug(`Converted Trezor xpubkey from ${getHdKeyPrefix(xpubkey)} to ${getHdKeyPrefix(normalizedXpub)}`)
        }
        return {
          xpub: normalizedXpub,
          path: derivationPath,
        }
      })
  }

  signPaymentTx(
    network: NetworkConfig,
    derivationPath: string,
    txData: PaymentTx,
  ): Promise<{ signedTxData: string }> {
    return Promise.resolve().then(() => {
      const bitcore = getBitcore(network.symbol)
      return Promise.all(txData.inputUtxos.map((utxo) =>
        bitcore.lookupTransaction(utxo.transactionHash)
          .then((txInfo) => this.splitTransaction(txInfo.hex, true, false))
          .then((splitTx) => ({
            ...utxo,
            splitTx,
          }))))
        .then((inputUtxos: Array<UtxoInfo & { splitTx: object }>) => {
          log.debug('inputUtxos', inputUtxos)

          const { changePath, outputScript, isSegwit } = txData
          const inputs: Array<[object, number]> = []
          const paths: string[] = []
          inputUtxos.forEach((utxo) => {
            inputs.push([utxo.splitTx, utxo.index])
            paths.push(joinDerivationPath(derivationPath, utxo.addressPath))
          })

          const changePathString = changePath ? joinDerivationPath(derivationPath, changePath) : undefined
          let sigHashType // undefined -> default (all)
          const additionals = []
          if (network.symbol === 'BCH') {
            // https://github.com/LedgerHQ/ledgerjs/issues/160#issuecomment-395634819
            additionals.push('abc')
            sigHashType = 0x41
          } else if (network.symbol === 'BTG') {
            additionals.push('gold')
          }
          return this.createPaymentTransactionNew(...log.debugInline('createPaymentTransactionNew', [
            inputs,
            paths,
            changePathString,
            outputScript,
            undefined, // lockTime, default (0)
            sigHashType,
            isSegwit,
            undefined, // initialTimestamp
            additionals,
            undefined, // expiryHeight
          ]))
        })
        .then((signedTxHex) => ({
          signedTxData: signedTxHex,
        }))
    })
  }
}

export default {
  eth: {
    getAddress: proxy(AppEth, 'getAddress'),
    signTransaction: proxy(AppEth, 'signTransaction'),
    getAppConfiguration: proxy(AppEth, 'getAppConfiguration'),
    signPersonalMessage: proxy(AppEth, 'signPersonalMessage'),
  },
  btc: new LedgerBtc(),
}

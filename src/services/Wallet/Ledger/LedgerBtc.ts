import HDKey from 'hdkey'
import AppBtc, { Transaction } from '@ledgerhq/hw-app-btc'
import { NetworkConfig } from 'Utilities/networks'
import { convertHdKeyPrefixForPath, getHdKeyPrefix, joinDerivationPath } from 'Utilities/bitcoin'
import { HdAccount } from 'Types'
import { getBitcore, PaymentTx, UtxoInfo } from 'Services/Bitcore'
import log from 'Log'
import { proxy } from './util'

type CreatePaymentTxParams = Parameters<AppBtc['createPaymentTransactionNew']>

export default class LedgerBtc {

  getWalletPublicKey = proxy(AppBtc, 'getWalletPublicKey')
  signMessageNew = proxy(AppBtc, 'signMessageNew')
  createPaymentTransactionNew = proxy(AppBtc, 'createPaymentTransactionNew')
  signP2SHTransaction = proxy(AppBtc, 'signP2SHTransaction')
  splitTransaction = proxy(AppBtc, 'splitTransaction')
  serializeTransactionOutputs = proxy(AppBtc, 'serializeTransactionOutputs')
  serializeTransaction = proxy(AppBtc, 'serializeTransaction')
  displayTransactionDebug = proxy(AppBtc, 'displayTransactionDebug')

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
        .then((inputUtxos: Array<UtxoInfo & { splitTx: Transaction }>) => {
          log.debug('inputUtxos', inputUtxos)

          const { changePath, outputScript, isSegwit } = txData
          const inputs: CreatePaymentTxParams[0] = []
          const paths: string[] = []
          inputUtxos.forEach((utxo) => {
            inputs.push([utxo.splitTx, utxo.index, undefined, undefined])
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
          const args: CreatePaymentTxParams = [
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
          ]
          log.debug('createPaymentTransactionNew', args)
          return this.createPaymentTransactionNew(...args)
        })
        .then((signedTxHex) => ({
          signedTxData: signedTxHex,
        }))
    })
  }
}

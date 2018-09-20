import HDKey from 'hdkey'

import config from 'Config'
import log from 'Utilities/log'
import { toYpub, joinDerivationPath } from 'Utilities/bitcoin'
import Ledger from 'Services/Ledger'
import { UtxoInfo } from 'Services/Bitcore'

import BitcoinWallet from './BitcoinWallet'
import { Transaction } from '../types'
import { BtcTransaction } from './types'

const typeLabel = config.walletTypes.ledger.name

export default class BitcoinWalletLedger extends BitcoinWallet {

  static type = 'BitcoinWalletLedger'

  getType() { return BitcoinWalletLedger.type }

  getTypeLabel() { return typeLabel }

  getLabel() {
    return this.label || `Bitcoin${this.isLegacyAccount() ? ' legacy' : ''} account #${this.getAccountNumber()}`
  }

  static fromPath(derivationPath: string): Promise<BitcoinWalletLedger> {
    return Ledger.btc.getWalletPublicKey(derivationPath)
      .then(({ publicKey, chainCode }) => {
        log.debug('Ledger.btc.getWalletPublicKey success')
        const hdKey = new HDKey()
        hdKey.publicKey = Buffer.from(publicKey, 'hex')
        hdKey.chainCode = Buffer.from(chainCode, 'hex')
        let xpubkey = hdKey.publicExtendedKey
        if (derivationPath.startsWith('m/49\'')) {
          xpubkey = toYpub(xpubkey)
          log.debug('Converted segwit xpub to ypub')
        }
        return new BitcoinWalletLedger(xpubkey, derivationPath)
      })
  }

  /**
   * Sign a transaction using ledgerjs api
   */
  _signTx({ txData }: BtcTransaction): Promise<Partial<BtcTransaction>> {
    return Promise.all(txData.inputUtxos.map((utxo) =>
      this._bitcore.lookupTransaction(utxo.transactionHash)
        .then((txInfo) => Ledger.btc.splitTransaction(txInfo.hex, true, false))
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
          paths.push(joinDerivationPath(this.derivationPath, utxo.addressPath))
        })

        const changePathString = changePath ? joinDerivationPath(this.derivationPath, changePath) : undefined
        return Ledger.btc.createPaymentTransactionNew(
          inputs,
          paths,
          changePathString,
          outputScript,
          undefined, // lockTime, default (0)
          undefined, // sigHashType, default (all)
          isSegwit)
      })
      .then((signedTxHex) => ({
        signedTxData: signedTxHex,
      }))
  }
}

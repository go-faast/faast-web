import HDKey from 'hdkey'

import config from 'Config'
import log from 'Utilities/log'
import { xpubToYpub, joinDerivationPath } from 'Utilities/bitcoin'
import Ledger from 'Services/Ledger'

import BitcoinWallet from './BitcoinWallet'

const typeLabel = config.walletTypes.ledger.name

export default class BitcoinWalletLedger extends BitcoinWallet {

  static type = 'BitcoinWalletLedger';

  constructor(xpub, derivationPath, label) {
    super(xpub, label)
    this.derivationPath = derivationPath
  }

  getType() { return BitcoinWalletLedger.type }

  getTypeLabel() { return typeLabel }

  isLegacyAccount() { return this.derivationPath.startsWith('m/44') }

  getAccountNumber() { return Number.parseInt(this.derivationPath.match(/(\d+)'$/)[1]) + 1 }

  getLabel() { return this.label || `Bitcoin${this.isLegacyAccount() ? ' legacy' : ''} account #${this.getAccountNumber()}` }

  static fromPath(derivationPath) {
    return Ledger.btc.getWalletPublicKey(derivationPath)
      .then(({ publicKey, chainCode }) => {
        log.info('Ledger.btc.getWalletPublicKey success')
        const hdKey = new HDKey()
        hdKey.publicKey = Buffer.from(publicKey, 'hex')
        hdKey.chainCode = Buffer.from(chainCode, 'hex')
        let xpubkey = hdKey.publicExtendedKey
        if (derivationPath.startsWith('m/49\'')) {
          xpubkey = xpubToYpub(xpubkey)
          log.info('Converted segwit xpub to ypub')
        }
        return new BitcoinWalletLedger(xpubkey, derivationPath)
      })
  }

  _canSendAsset() { return true }

  isReadOnly() { return false }

  /**
  * Sign a transaction using ledgerjs api
  */
  _signTx(tx) {
    const { txData } = tx
    return Promise.all(txData.inputUtxos.map((utxo) =>
      this._bitcore.lookupTransaction(utxo.transactionHash)
        .then((txInfo) => Ledger.btc.splitTransaction(txInfo.hex, true, false))
        .then((splitTx) => ({
          ...utxo,
          splitTx
        }))))
      .then((inputUtxos) => {
        log.info('inputUtxos', inputUtxos)

        const { changePath, outputScript, isSegwit } = txData
        const inputs = []
        const paths = []
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
        signedTxData: signedTxHex
      }))
  }
}

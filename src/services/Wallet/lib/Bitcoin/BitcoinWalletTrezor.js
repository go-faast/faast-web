import config from 'Config'
import log from 'Utilities/log'
import { toSmallestDenomination } from 'Utilities/convert'
import { xpubToYpub } from 'Utilities/bitcoin'
import Trezor from 'Services/Trezor'

import BitcoinWallet from './BitcoinWallet'

const typeLabel = config.walletTypes.trezor.name

export default class BitcoinWalletTrezor extends BitcoinWallet {

  static type = 'BitcoinWalletTrezor';

  constructor(xpub, derivationPath, label) {
    super(xpub, label)
    this.derivationPath = derivationPath
  }

  getType() { return BitcoinWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  isLegacyAccount() { return this.derivationPath.startsWith('m/44') }

  getAccountNumber() { return Number.parseInt(this.derivationPath.match(/(\d+)'$/)[1]) + 1 }

  getLabel() { return this.label || `Bitcoin${this.isLegacyAccount() ? ' legacy' : ''} account #${this.getAccountNumber()}` }

  static fromPath(derivationPath = null) {
    Trezor.setCurrency('BTC')
    return Trezor.getXPubKey(derivationPath)
      .then((result) => {
        log.info('Trezor xPubKey success')
        let { xpubkey, serializedPath } = result
        if (!serializedPath.startsWith('m/') && /^\d/.test(serializedPath)) {
          serializedPath = `m/${serializedPath}`
        }
        if (serializedPath.startsWith('m/49\'')) {
          xpubkey = xpubToYpub(xpubkey)
          log.info('Converted segwit xpub to ypub')
        }
        return new BitcoinWalletTrezor(xpubkey, serializedPath)
      })
  }

  _createAggregateTransaction(outputs, asset) {
    return Promise.resolve().then(() => ({
      feeAmount: null,
      feeSymbol: 'BTC',
      txData: outputs.map(({ address, amount }) => ({
        address,
        amount: toSmallestDenomination(amount, asset.decimals).toNumber(),
      })),
    }))
  }


  _signTx(tx) {
    return Trezor.composeAndSignTx(tx.txData)
      .then((result) => {
        log.info('Transaction composed and signed:', result)
        const { serialized_tx: signedTxData } = result
        return {
          signedTxData
        }
      })
  }

  _validateTxData(txData) {
    if (txData === null || !Array.isArray(txData)) {
      throw new Error(`Invalid ${this.getType()} txData of type ${typeof txData}`)
    }
    return txData
  }
}

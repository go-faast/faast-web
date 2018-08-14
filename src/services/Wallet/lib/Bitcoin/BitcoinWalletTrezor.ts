import config from 'Config'
import log from 'Utilities/log'
import { xpubToYpub, derivationPathStringToArray } from 'Utilities/bitcoin'
import Trezor, { TrezorOutput } from 'Services/Trezor'

import BitcoinWallet from './BitcoinWallet'
import { BtcTransaction } from './types'

const typeLabel = config.walletTypes.trezor.name

export default class BitcoinWalletTrezor extends BitcoinWallet {

  static type = 'BitcoinWalletTrezor'

  constructor(xpub: string, derivationPath: string, label?: string) {
    super(xpub, derivationPath, label)
  }

  getType() { return BitcoinWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  getLabel() {
    return this.label || `Bitcoin${this.isLegacyAccount() ? ' legacy' : ''} account #${this.getAccountNumber()}`
  }

  static fromPath(derivationPath: string | null = null) {
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

  _signTx(tx: BtcTransaction): Promise<Partial<BtcTransaction>> {
    const { txData: { inputUtxos, outputs, change, changePath } } = tx
    const baseDerivationPathArray = derivationPathStringToArray(this.derivationPath)
    const trezorInputs = inputUtxos.map(({ addressPath, transactionHash, index, value }) => ({
      address_n: baseDerivationPathArray.concat(addressPath),
      prev_hash: transactionHash,
      prev_index: index,
      ...(this.isLegacyAccount() ? {} : {
        amount: value,
        script_type: 'SPENDP2SHWITNESS',
      }),
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
        script_type: this.isLegacyAccount() ? 'PAYTOADDRESS' : 'PAYTOP2SHWITNESS',
      })
    }
    log.debug('_signTx inputs outputs', trezorInputs, trezorOutputs)
    return Trezor.signTx(trezorInputs, trezorOutputs)
      .then((result) => {
        log.info('Transaction signed:', result)
        const { serialized_tx: signedTxData } = result
        return {
          signedTxData,
        }
      })
  }
}

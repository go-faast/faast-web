import config from 'Config'
import log from 'Utilities/log'
import Trezor, { TrezorOutput } from 'Services/Trezor'
import networks from 'Utilities/networks'

import BitcoinWallet from './BitcoinWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.trezor.name

export default class BitcoinWalletTrezor extends BitcoinWallet {

  static type = 'BitcoinWalletTrezor'

  getType() { return BitcoinWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath?: string | null) {
    return Trezor.getHdAccount(networks.BTC, derivationPath)
      .then(({ xpub, path }) => new BitcoinWalletTrezor(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Trezor.signPaymentTx(this._network, this.derivationPath, txData)
  }
}

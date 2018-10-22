import config from 'Config'
import log from 'Utilities/log'
import Trezor, { TrezorOutput } from 'Services/Trezor'
import networks from 'Utilities/networks'

import LitecoinWallet from './LitecoinWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.trezor.name

export default class LitecoinWalletTrezor extends LitecoinWallet {

  static type = 'LitecoinWalletTrezor'

  getType() { return LitecoinWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath?: string | null) {
    return Trezor.getHdAccount(networks.LTC, derivationPath)
      .then(({ xpub, path }) => new LitecoinWalletTrezor(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Trezor.signPaymentTx(this._network, this.derivationPath, txData)
  }
}

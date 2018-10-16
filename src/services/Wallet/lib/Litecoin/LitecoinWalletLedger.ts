import config from 'Config'
import log from 'Utilities/log'
import Ledger from 'Services/Ledger'
import networks from 'Utilities/networks'

import LitecoinWallet from './LitecoinWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.ledger.name

export default class LitecoinWalletLedger extends LitecoinWallet {

  static type = 'LitecoinWalletLedger'

  getType() { return LitecoinWalletLedger.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath: string): Promise<LitecoinWalletLedger> {
    return Ledger.btc.getHdAccount(networks.LTC, derivationPath)
      .then(({ xpub, path }) => new LitecoinWalletLedger(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Ledger.btc.signPaymentTransaction(this._network, this.derivationPath, txData)
  }
}

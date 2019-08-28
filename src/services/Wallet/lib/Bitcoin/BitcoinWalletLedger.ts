import config from 'Config'
import log from 'Utilities/log'
import Ledger from 'Services/Ledger'
import networks from 'Utilities/networks'

import BitcoinWallet from './BitcoinWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.ledger.name

export default class BitcoinWalletLedger extends BitcoinWallet {

  static type = 'BitcoinWalletLedger'

  getType() { return BitcoinWalletLedger.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath: string): Promise<BitcoinWalletLedger> {
    return Ledger.btc.getHdAccount(networks.BTC, derivationPath)
      .then(({ xpub, path }) => new BitcoinWalletLedger(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Ledger.btc.signPaymentTx(this._network, this.derivationPath, txData)
  }
}

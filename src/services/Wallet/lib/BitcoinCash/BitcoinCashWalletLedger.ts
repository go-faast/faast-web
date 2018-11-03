import config from 'Config'
import log from 'Utilities/log'
import Ledger from 'Services/Ledger'
import networks from 'Utilities/networks'

import BitcoinCashWallet from './BitcoinCashWallet'
import { BitcoreTransaction } from '../types'

const typeLabel = config.walletTypes.ledger.name

export default class BitcoinCashWalletLedger extends BitcoinCashWallet {

  static type = 'BitcoinCashWalletLedger'

  getType() { return BitcoinCashWalletLedger.type }

  getTypeLabel() { return typeLabel }

  static fromPath(derivationPath: string): Promise<BitcoinCashWalletLedger> {
    return Ledger.btc.getHdAccount(networks.BCH, derivationPath)
      .then(({ xpub, path }) => new BitcoinCashWalletLedger(xpub, path))
  }

  _signTx({ txData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
    return Ledger.btc.signPaymentTx(this._network, this.derivationPath, txData)
  }
}

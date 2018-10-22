import log from 'Utilities/log'
import networks from 'Utilities/networks'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate } from '../types'

const DEFAULT_FEE_PER_BYTE = 1

export default abstract class BitcoinCashWallet extends BitcoreWallet {

  static type = 'BitcoinCashWallet'

  constructor(xpub: string, derivationPath: string, label?: string) {
    super(networks.BCH, xpub, derivationPath, label)
  }

  getLabel() {
    return this.label || `${this._network.name} account #${this.getAccountNumber()}`
  }

  _getDefaultFeeRate(
    asset: Asset,
  ): Promise<FeeRate> {
    return Promise.resolve({
      rate: DEFAULT_FEE_PER_BYTE,
      unit: 'sat/byte',
    })
  }

  isReadOnly() { return true }

}

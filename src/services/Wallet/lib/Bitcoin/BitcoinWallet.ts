import log from 'Utilities/log'
import { fetchGet } from 'Utilities/fetch'
import networks from 'Utilities/networks'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate } from '../types'

const DEFAULT_FEE_PER_BYTE = 50

export default abstract class BitcoinWallet extends BitcoreWallet {

  static type = 'BitcoinWallet'

  constructor(xpub: string, derivationPath: string, label?: string) {
    super(networks.BTC, xpub, derivationPath, label)
  }

  getLabel() {
    const legacyInfix = this.isLegacyAccount() ? ' legacy' : ''
    return this.label || `${this._network.name}${legacyInfix} account #${this.getAccountNumber()}`
  }

  _getDefaultFeeRate(
    asset: Asset,
    { level = 'medium' }: { level?: 'high' | 'medium' | 'low' } = {},
  ): Promise<FeeRate> {
    return fetchGet('https://api.blockcypher.com/v1/btc/main')
      .then((result) => {
        const feePerKb = result[`${level}_fee_per_kb`] || (DEFAULT_FEE_PER_BYTE * 1000)
        return feePerKb / 1000
      })
      .catch((e) => {
        log.error('Failed to get bitcoin dynamic fee, using default', e)
        return DEFAULT_FEE_PER_BYTE
      })
      .then((feePerByte) => ({
        rate: feePerByte,
        unit: 'sat/byte',
      }))
  }

}

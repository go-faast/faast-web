import log from 'Utilities/log'
import { fetchGet } from 'Utilities/fetch'
import networks from 'Utilities/networks'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate } from '../types'

const DEFAULT_FEE_PER_BYTE = 10

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
    asset?: Asset,
    { level = 'medium' }: { level?: 'high' | 'medium' | 'low' } = {},
    networkNo = 0,
  ): Promise<FeeRate> {
    const url = `${networks.BTC.bitcoreUrls[networkNo]}/api/estimatefee/1`
    console.log(url)
    return fetchGet(url)
      .then(({ result }) => {
        const feePerKb: number = parseFloat(result) * 100000 || (DEFAULT_FEE_PER_BYTE * 1000)
        console.log('fee', feePerKb)
        return Math.round(feePerKb)
      })
      .catch((e) => {
        log.error('Failed to get bitcoin dynamic fee, using default', e)
        return DEFAULT_FEE_PER_BYTE
      })
      .then((feePerByte: number) => ({
        rate: feePerByte,
        unit: 'sat/byte',
      }))
  }

}

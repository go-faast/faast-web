import bchaddr from 'bchaddrjs'

import log from 'Utilities/log'
import networks from 'Utilities/networks'
import { fetchGet } from 'Utilities/fetch'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate } from '../types'

const DEFAULT_FEE_PER_BYTE = 10

// Adjust recommended dynamic fee by manual factor
const FEE_ADJUSTMENT_FACTOR = 2

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
    return fetchGet('https://bitcoincash.blockexplorer.com/api/utils/estimatefee')
      .then((result) => {
        const feePerKb = result['2']
        if (feePerKb) {
          return (feePerKb * 1e8 / 1000) * FEE_ADJUSTMENT_FACTOR
        }
        return DEFAULT_FEE_PER_BYTE
      })
      .catch((e) => {
        log.error(`Failed to get ${this._network.name} dynamic fee, using default`, e)
        return DEFAULT_FEE_PER_BYTE
      })
      .then((feePerByte) => ({
        rate: feePerByte,
        unit: 'sat/byte',
      }))
  }

}

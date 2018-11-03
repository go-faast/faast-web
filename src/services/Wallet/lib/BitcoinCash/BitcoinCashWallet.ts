import bchaddr from 'bchaddrjs'

import log from 'Utilities/log'
import networks from 'Utilities/networks'
import { fetchGet } from 'Utilities/fetch'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate, AddressFormat } from '../types'

const DEFAULT_FEE_PER_BYTE = 10

// Adjust recommended dynamic fee by manual factor
const FEE_ADJUSTMENT_FACTOR = 2

const LEGACY_FORMAT: AddressFormat = {
  type: bchaddr.Format.Legacy,
  label: 'Legacy',
  description: 'Legacy address format. Inherited from forking Bitcoin.',
  test: bchaddr.isLegacyAddress,
  convert: bchaddr.toLegacyAddress,
}

const CASH_ADDR_FORMAT: AddressFormat = {
  type: bchaddr.Format.Cashaddr,
  label: 'Cash Address',
  description: 'New Bitcoin Cash address format introduced in 2018.',
  test: bchaddr.isCashAddress,
  convert: bchaddr.toCashAddress,
}

const COPAY_FORMAT: AddressFormat = {
  type: bchaddr.Format.Bitpay,
  label: 'BitPay',
  description: 'Proprietary format created by BitPay for their Copay app. Not widely used.',
  test: bchaddr.isBitpayAddress,
  convert: bchaddr.toBitpayAddress,
}

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

  _getDefaultAddressFormat() {
    return LEGACY_FORMAT
  }

  _getAddressFormats() {
    return [CASH_ADDR_FORMAT, LEGACY_FORMAT, COPAY_FORMAT]
  }

}

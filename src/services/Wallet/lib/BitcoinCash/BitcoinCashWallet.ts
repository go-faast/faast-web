import bchaddr from 'bchaddrjs'

import log from 'Utilities/log'
import networks from 'Utilities/networks'

import BitcoreWallet from '../BitcoreWallet'

import { Asset } from 'Types'
import { BitcoreTransaction, FeeRate, AddressFormat } from '../types'

const DEFAULT_FEE_PER_BYTE = 10

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
    return Promise.resolve({
      rate: DEFAULT_FEE_PER_BYTE,
      unit: 'sat/byte',
    })
  }

  _getDefaultAddressFormat() {
    return CASH_ADDR_FORMAT
  }

  _getAddressFormats() {
    return [CASH_ADDR_FORMAT, LEGACY_FORMAT, COPAY_FORMAT]
  }

}

import bchaddr from 'bchaddrjs'

import { Tester, Converter, Validator, FormatConfig, AddressFormat, safeTest, validateFromTest } from '../common'

const bchTestLegacy = safeTest(bchaddr.isLegacyAddress)
const bchTestCashAddress = safeTest(bchaddr.isCashAddress)
const bchTestBitpay = safeTest(bchaddr.isBitpayAddress)

class BchAddressFormat implements AddressFormat {

  validate: Validator

  constructor(
    public type: string, public label: string, public description: string,
    public test: Tester, public convert: Converter,
  ) {
    this.validate = validateFromTest(test, 'Bitcoin Cash', `(${label} format)`)
  }
}

export const bchLegacyFormat = new BchAddressFormat(
  bchaddr.Format.Legacy,
  'Legacy',
  'Legacy base58 address format. Inherited from forking Bitcoin.',
  bchTestLegacy,
  bchaddr.toLegacyAddress,
)

export const bchCashAddrFormat = new BchAddressFormat(
  bchaddr.Format.Cashaddr,
  'CashAddr',
  'Standard Bitcoin Cash address format introduced in 2018.',
  bchTestCashAddress,
  bchaddr.toCashAddress,
)

export const bchBitPayFormat = new BchAddressFormat(
  bchaddr.Format.Bitpay,
  'BitPay',
  'Proprietary format created by BitPay for their Copay app. Not widely used.',
  bchTestBitpay,
  bchaddr.toBitpayAddress,
)

const config: FormatConfig = {
  default: bchCashAddrFormat.type,
  formats: [bchLegacyFormat, bchCashAddrFormat, bchBitPayFormat],
}

export default config

import bchaddr from 'bchaddrjs'

import { Tester, FormatConfig, safeTest, validateFromTest } from '../common'

const bchTestLegacy = safeTest(bchaddr.isLegacyAddress)
const bchTestCashAddress = safeTest(bchaddr.isCashAddress)
const bchTestBitpay = safeTest(bchaddr.isBitpayAddress)

const bchValidate = (test: Tester) => validateFromTest(test, 'Bitcoin Cash')

const config: FormatConfig = {
  default: 'cashaddr',
  formats: [
    {
      type: bchaddr.Format.Legacy,
      label: 'Legacy',
      description: 'Legacy base58 address format. Inherited from forking Bitcoin.',
      test: bchTestLegacy,
      validate: bchValidate(bchTestLegacy),
      convert: bchaddr.toLegacyAddress,
    },
    {
      type: bchaddr.Format.Cashaddr,
      label: 'Cash Address',
      description: 'New Bitcoin Cash address format introduced in 2018.',
      test: bchTestCashAddress,
      validate: bchValidate(bchTestCashAddress),
      convert: bchaddr.toCashAddress,
    },
    {
      type: bchaddr.Format.Bitpay,
      label: 'BitPay',
      description: 'Proprietary format created by BitPay for their Copay app. Not widely used.',
      test: bchTestBitpay,
      validate: bchValidate(bchTestBitpay),
      convert: bchaddr.toBitpayAddress,
    },
  ],
}

export default config

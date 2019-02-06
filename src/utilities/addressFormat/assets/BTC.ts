import { identity } from 'lodash'

import networks from 'Utilities/networks'
import { isValidAddress as isValidBitcoinAddress } from 'Utilities/bitcoin'

import { AddressFormat, FormatConfig, testFromValidate } from '../common'

function btcValidate(address: string) {
  if (!isValidBitcoinAddress(address, networks.BTC)) {
    return 'Invalid Bitcoin address'
  }
}

export const btcLegacyFormat: AddressFormat = {
  type: 'legacy',
  label: 'Legacy address format',
  description: 'Legacy base58 address format.',
  test: testFromValidate(btcValidate),
  validate: btcValidate,
  convert: identity,
}

const config: FormatConfig = {
  default: btcLegacyFormat.type,
  formats: [btcLegacyFormat],
}

export default config

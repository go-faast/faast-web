import { identity } from 'lodash'

import networks from 'Utilities/networks'
import { isValidAddress as isValidBitcoinAddress } from 'Utilities/bitcoin'

import { AddressFormat, FormatConfig, testFromValidate } from '../common'

function btcValidate(address: string) {
  if (!isValidBitcoinAddress(address, networks.BTC)) {
    return 'Invalid Bitcoin address'
  }
}

export const bitcoinjsFormat: AddressFormat = {
  type: 'bitcoin',
  label: 'Bitcoin address format',
  description: 'Address format as per bitcoinjs-lib spec, including both base58/bech32 encodings.',
  test: testFromValidate(btcValidate),
  validate: btcValidate,
  convert: identity,
}

const config: FormatConfig = {
  default: bitcoinjsFormat.type,
  formats: [bitcoinjsFormat],
}

export default config

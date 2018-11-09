import web3 from 'Services/Web3'

import { FormatConfig, testFromValidate } from '../common'

function ethValidate(address: string) {
  if (!web3.utils.isAddress(address)) {
    return 'Invalid Ethereum address'
  }
}

function ethValidateChecksum(address: string) {
  if (!web3.utils.checkAddressChecksum(address)) {
    return 'Invalid Ethereum checksum address'
  }
}

const config: FormatConfig = {
  default: 'hex',
  formats: [
    {
      type: 'hex',
      label: 'Hexadecimal',
      description: 'Default hexadecimal format.',
      test: testFromValidate(ethValidate),
      validate: ethValidate,
      convert: (a) => a.toLowerCase(),
    },
    {
      type: 'checksum',
      label: 'Checksum',
      description: 'Hexadecimal format with checksum.',
      test: testFromValidate(ethValidateChecksum),
      validate: ethValidateChecksum,
      convert: web3.utils.toChecksumAddress,
    },
  ],
}

export default config

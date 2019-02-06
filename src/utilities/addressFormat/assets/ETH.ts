import web3 from 'Services/Web3'

import { AddressFormat, FormatConfig, testFromValidate } from '../common'

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

export const ethHexFormat: AddressFormat = {
  type: 'hex',
  label: 'Hexadecimal',
  description: 'Default hexadecimal format.',
  test: testFromValidate(ethValidate),
  validate: ethValidate,
  convert: (a) => a.toLowerCase(),
}

export const ethChecksumFormat: AddressFormat = {
  type: 'checksum',
  label: 'Checksum',
  description: 'Hexadecimal format with checksum.',
  test: testFromValidate(ethValidateChecksum),
  validate: ethValidateChecksum,
  convert: web3.utils.toChecksumAddress,
}

const config: FormatConfig = {
  default: ethHexFormat.type,
  formats: [ethHexFormat, ethChecksumFormat],
}

export default config

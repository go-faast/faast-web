import { pick, identity } from 'lodash'
import bchaddr from 'bchaddrjs'

import web3 from 'Services/Web3'
import networks from 'Utilities/networks'
import { isValidAddress as isValidBitcoinAddress } from 'Utilities/bitcoin'

export interface AddressFormat {
  type: string // format identifier (e.g. 'legacy', 'cashaddr', etc)
  label: string // human friendly label
  description: string // human friendly description
  test: (address: string) => boolean
  convert: (address: string) => string
}

interface FormatConfig {
  default: string
  formats: AddressFormat[]
}

export const DEFAULT_FORMAT: AddressFormat = {
  type: 'default',
  label: 'Default',
  description: 'Default address format',
  test: () => true,
  convert: identity,
}

const DEFAULT: FormatConfig = {
  default: DEFAULT_FORMAT.type,
  formats: [DEFAULT_FORMAT],
}

function safeTest<T>(test: (x: T) => boolean): (x: T) => boolean {
  return (x: T) => {
    try {
      return test(x)
    } catch (e) {
      return false
    }
  }
}

export const ETH: FormatConfig = {
  default: 'hex',
  formats: [
    {
      type: 'hex',
      label: 'Hexadecimal',
      description: 'Default hexadecimal format.',
      test: web3.utils.isAddress,
      convert: (a: string) => a.toLowerCase(),
    },
    {
      type: 'checksum',
      label: 'Checksum',
      description: 'Hexadecimal format with checksum.',
      test: (a: string) => typeof a === 'string' && web3.utils.checkAddressChecksum(a),
      convert: web3.utils.toChecksumAddress,
    },
  ],
}

export const BTC: FormatConfig = {
  default: 'legacy',
  formats: [
    {
      type: 'legacy',
      label: 'Legacy address format',
      description: 'Legacy base58 address format.',
      test: (a) => isValidBitcoinAddress(a, networks.BTC),
      convert: identity,
    },
  ],
}

export const BCH: FormatConfig = {
  default: 'cashaddr',
  formats: [
    {
      type: bchaddr.Format.Legacy,
      label: 'Legacy',
      description: 'Legacy base58 address format. Inherited from forking Bitcoin.',
      test: safeTest(bchaddr.isLegacyAddress),
      convert: bchaddr.toLegacyAddress,
    },
    {
      type: bchaddr.Format.Cashaddr,
      label: 'Cash Address',
      description: 'New Bitcoin Cash address format introduced in 2018.',
      test: safeTest(bchaddr.isCashAddress),
      convert: bchaddr.toCashAddress,
    },
    {
      type: bchaddr.Format.Bitpay,
      label: 'BitPay',
      description: 'Proprietary format created by BitPay for their Copay app. Not widely used.',
      test: safeTest(bchaddr.isBitpayAddress),
      convert: bchaddr.toBitpayAddress,
    },
  ],
}

const ALL_FORMATS: { [symbol: string]: FormatConfig } = {
  ETH, BTC, BCH,
}

function getFormatConfig(symbol: string): FormatConfig {
  return ALL_FORMATS[symbol] || DEFAULT
}

export function getFormats(symbol: string): AddressFormat[] {
  return getFormatConfig(symbol).formats
}

export function getDefaultFormat(symbol: string): AddressFormat {
  const formatConfig = getFormatConfig(symbol)
  return formatConfig.formats.find((f) => f.type === formatConfig.default) || DEFAULT_FORMAT
}

export function isValidAddress(address: string, symbol: string): boolean {
  return getDefaultFormat(symbol).test(address)
}

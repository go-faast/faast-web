import { identity } from 'lodash'

export type Tester = (address: string) => boolean
export type Validator = (address: string) => string | undefined
export type Converter = (address: string) => string

export interface AddressFormat {
  type: string // format identifier (e.g. 'legacy', 'cashaddr', etc)
  label: string // human friendly label
  description: string // human friendly description
  test: Tester // true if valid address, false otherwise
  validate: Validator // returns an error if invalid address, undefined otherwise
  convert: Converter // convert address to this format, throws cannot convert
}

export interface FormatConfig {
  default: string
  formats: AddressFormat[]
}

export const DEFAULT_FORMAT: AddressFormat = {
  type: 'default',
  label: 'Default',
  description: 'Default address format',
  test: () => true,
  validate: () => undefined,
  convert: identity,
}

export const DEFAULT: FormatConfig = {
  default: DEFAULT_FORMAT.type,
  formats: [DEFAULT_FORMAT],
}

export function safeTest(test: Tester): Tester {
  return (a: string) => {
    try {
      return test(a)
    } catch (e) {
      return false
    }
  }
}

export function validateFromTest(test: Tester, assetName: string): Validator {
  return (address: string) => {
    if (!test(address)) {
      return `Invalid ${assetName} address`
    }
  }
}

export function testFromValidate(validate: Validator): Tester {
  return (address: string) => !validate(address)
}

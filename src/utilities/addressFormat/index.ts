import { FormatConfig, AddressFormat, DEFAULT, DEFAULT_FORMAT } from './common'
import * as allAssetConfigs from './assets'

export * from './assets'
export { AddressFormat, DEFAULT_FORMAT }

const ALL_CONFIGS = { ...(allAssetConfigs as { [symbol: string]: FormatConfig }) }

function getFormatConfig(symbol: string): FormatConfig {
  return ALL_CONFIGS[symbol] || DEFAULT
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

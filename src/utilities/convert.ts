import BigNumber from 'bignumber.js'
import EthereumjsUtil from 'ethereumjs-util'
import padLeft from 'pad-left'
import config from 'Config'
import { addHexPrefix } from 'Utilities/helpers'

if (!config.isDev) {
  BigNumber.config({ ERRORS: false })
}

const ZERO = new BigNumber(0)
const TEN = new BigNumber(10)

export { ZERO, TEN, BigNumber }

export type Numerical = BigNumber | number | string

export function toBigNumber(value: Numerical = 0): BigNumber {
  if (value === '0x') { value = 0 }
  if (!(value instanceof BigNumber)) {
    try {
      const bn = new BigNumber(String(value))
      return bn
    } catch (e) {
      return ZERO
    }
  }
  return value
}

export function toNumber(value: Numerical = 0): number {
  if (typeof value === 'number') {
    return value
  }
  if (typeof value === 'string') {
    value = toBigNumber(value)
  }
  if (value instanceof BigNumber) {
    return value.toNumber()
  }
  return 0
}

export function toMainDenomination(value: Numerical, decimals: number): BigNumber {
  value = toBigNumber(value)
  const power = TEN.toPower(decimals)
  return value.div(power)
}

export function toSmallestDenomination(value: Numerical, decimals: number): BigNumber {
  value = toBigNumber(value)
  const power = TEN.toPower(decimals)
  return value.times(power)
}

export function toPrecision(amount: Numerical, decimals: number): BigNumber {
  amount = toBigNumber(amount)
  const power = TEN.toPower(decimals)
  return amount.times(power).round().div(power)
}

export function toUnit(amount: Numerical, rate: Numerical, decimals: number, rateFrom: boolean): BigNumber {
  amount = toBigNumber(amount)
  rate = toBigNumber(rate)
  const conversion = rateFrom ? amount.div(rate) : amount.times(rate)
  return toPrecision(conversion, decimals)
}

export function toPercentage(amount: Numerical, total: Numerical): BigNumber {
  amount = toBigNumber(amount)
  total = toBigNumber(total)
  return amount.div(total).times(100).round(2)
}

export function toTxFee(gasLimit: Numerical, gasPrice: Numerical): BigNumber {
  gasLimit = toBigNumber(gasLimit)
  gasPrice = toBigNumber(gasPrice)
  const power = TEN.toPower(18)
  return gasLimit.times(gasPrice).div(power)
}

export function toHex(value: Numerical): string {
  value = toBigNumber(value)
  return addHexPrefix(value.toString(16))
}

export function toChecksumAddress(address: string): string {
  return EthereumjsUtil.toChecksumAddress(address)
}

function formatTimePart(part: number): string {
  return padLeft(part.toString(), 2, '0')
}

export function secondsToTime(secs: number): { hours: string, minutes: string, seconds: string } {
  const hours = formatTimePart(Math.floor(secs / (60 * 60)))
  const divisorForMinutes = secs % (60 * 60)
  const minutes = formatTimePart(Math.floor(divisorForMinutes / 60))
  const divisorForSeconds = divisorForMinutes % 60
  const seconds = formatTimePart(Math.floor(divisorForSeconds))
  let timeObj: { hours: string, minutes: string, seconds: string } = { hours, minutes, seconds }
  // no negative
  if (parseInt(seconds) < 0) { timeObj = { hours: '0', minutes: '00', seconds: '00' } }
  return timeObj
}

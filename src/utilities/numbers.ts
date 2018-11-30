import BigNumber from 'bignumber.js'
import BN from 'bn.js'
import config from 'Config'

if (!config.isDev) {
  BigNumber.config({ ERRORS: false })
}

const ZERO = new BigNumber(0)
const ONE = new BigNumber(1)
const TEN = new BigNumber(10)
const HUNDRED = new BigNumber(100)
const THOUSAND = new BigNumber(1000)

export { BigNumber, BN, ZERO, ONE, TEN, HUNDRED, HUNDRED as ONE_HUNDRED, THOUSAND }

export type Numerical = BigNumber | BN | number | string

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

const abbreviateSuffixes = 'KMBT'
export function abbreviateNumber(n: Numerical): { value: BigNumber, suffix?: string } {
  n = toBigNumber(n)
  if (n.lt(THOUSAND)) {
    return { value: n }
  }
  const digits = n.abs().floor().toString().length
  const base = Math.min(Math.ceil(digits / 3), abbreviateSuffixes.length) - 1
  const suffix = abbreviateSuffixes[base - 1]
  const abbreviated = n.div(THOUSAND.pow(base))
  return { value: abbreviated, suffix }
}

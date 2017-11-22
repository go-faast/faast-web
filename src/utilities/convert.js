import BigNumber from 'bignumber.js'

if (!window.faast.dev) {
  BigNumber.config({ ERRORS: false })
} else {
  window.BigNumber = BigNumber
}

const TEN = new BigNumber(10)

export const toBigNumber = (value = 0) => {
  if (value === '0x') value = 0
  if (!(value instanceof BigNumber)) return new BigNumber(String(value))
  return value
}

export const toMainDenomination = (value, decimals) => {
  value = toBigNumber(value)
  const power = TEN.toPower(decimals)
  return value.div(power)
}

export const toSmallestDenomination = (value, decimals) => {
  value = toBigNumber(value)
  const power = TEN.toPower(decimals)
  return value.times(power)
}

export const toPrecision = (amount, decimals) => {
  amount = toBigNumber(amount)
  const power = TEN.toPower(decimals)
  return amount.times(power).round().div(power)
}

export const toUnit = (amount, rate, decimals, rateFrom) => {
  amount = toBigNumber(amount)
  rate = toBigNumber(rate)
  const conversion = rateFrom ? amount.div(rate) : amount.times(rate)
  return toPrecision(conversion, decimals)
}

export const toPercentage = (amount, total) => {
  amount = toBigNumber(amount)
  total = toBigNumber(total)
  return amount.div(total).times(100).round(2)
}

export const toTxFee = (gasLimit, gasPrice) => {
  gasLimit = toBigNumber(gasLimit)
  gasPrice = toBigNumber(gasPrice)
  const power = TEN.toPower(18)
  return gasLimit.times(gasPrice).div(power)
}

export const toHex = (value) => {
  value = toBigNumber(value)
  if (window.faast && window.faast.web3 && window.faast.web3.utils) {
    return window.faast.web3.utils.numberToHex(value)
  }
  return '0x0'
}

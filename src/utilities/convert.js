import BigNumber from 'bignumber.js'
import EthereumjsUtil from 'ethereumjs-util'
import web3 from 'Services/Web3'
import config from 'Config'

if (!config.isDev) {
  BigNumber.config({ ERRORS: false })
} else {
  window.BigNumber = BigNumber
}

const ZERO = new BigNumber(0)
const TEN = new BigNumber(10)

export { ZERO, TEN, BigNumber }

export const toBigNumber = (value = 0) => {
  if (value === '0x') value = 0
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

export const toNumber = (value = 0) => {
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
  if (web3.utils) {
    return web3.utils.numberToHex(value)
  }
  return '0x0'
}

export const toChecksumAddress = (address) => {
  return EthereumjsUtil.toChecksumAddress(address)
}

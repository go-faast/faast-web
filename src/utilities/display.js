import accounting from 'accounting'
import BigNumber from 'bignumber.js'
import { shortener } from 'Utilities/helpers'
import { toBigNumber } from 'Utilities/convert'
import { expandable } from 'Utilities/reactFuncs'

const PENNY = new BigNumber(0.01)

export const fiat = (value) => {
  return accounting.formatMoney(value)
}

const randInt = () => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)

export const units = (value, symbol, price, showSymbol = true) => {
  value = toBigNumber(value)
  let shortened = value.toString()
  if (price) shortened = shortenUnit(value, price, 4)
  return expandable({
    id: `unit-${symbol}-${randInt()}`,
    extra: symbol,
    showExtra: showSymbol,
    expanded: value.toString(),
    shrunk: shortened
  })
}

export const shortenUnit = (value, price, decMin = 1) => {
  value = toBigNumber(value)
  const valueStr = value.toString()
  const pennyValue = PENNY.div(price).toString()
  let decLimit = pennyValue.slice(pennyValue.indexOf('.') + 1).split(/([1-9])/)[0].length + 1
  decLimit = decLimit < decMin ? decMin : decLimit
  const limit = valueStr.indexOf('.') + 1 + decLimit
  return shortener(valueStr, limit, false)
}

export const percentage = (value, showPositive) => {
  const rounded = accounting.toFixed(value, 2)

  if (showPositive && value > 0) return `+${rounded}%`
  return `${rounded}%`
}

export const ellipsize = (str, maxStartChars, maxEndChars) => {
  if (str.length <= maxStartChars + maxEndChars) {
    return str
  }
  return `${str.slice(0, maxStartChars)}…${str.slice(-maxEndChars)}`
}

export default {
  fiat,
  units,
  percentage,
  ellipsize
}

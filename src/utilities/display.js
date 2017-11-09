import accounting from 'accounting'
import BigNumber from 'bignumber.js'
import { shortener } from 'Utilities/helpers'
import { toBigNumber } from 'Utilities/convert'
import { expandable } from 'Utilities/reactFuncs'

const PENNY = new BigNumber(0.01)

const fiat = (value) => {
  return accounting.formatMoney(value)
}

const units = (value, symbol, price) => {
  value = toBigNumber(value)
  let shortened = value.toString()
  if (price) shortened = shortenUnit(value, price, 8)
  return expandable({
    id: `unit-${symbol}-${Math.random()}`,
    extra: symbol,
    expanded: value.toString(),
    shrunk: shortened
  })
}

const shortenUnit = (value, price, decMin = 1) => {
  value = toBigNumber(value)
  const valueStr = value.toString()
  const pennyValue = PENNY.div(price).toString()
  let decLimit = pennyValue.slice(pennyValue.indexOf('.') + 1).split(/([1-9])/)[0].length + 1
  decLimit = decLimit < decMin ? decMin : decLimit
  const limit = valueStr.indexOf('.') + 1 + decLimit
  return shortener(valueStr, limit)
}

const percentage = (value, showPositive) => {
  const rounded = accounting.toFixed(value, 2)

  if (showPositive && value > 0) return `+${rounded}%`
  return `${rounded}%`
}

export default {
  fiat,
  units,
  percentage
}

import { getDefaultFormat } from 'Utilities/addressFormat'
import { toBigNumber } from 'Utilities/convert'

const isProvided = (x) => typeof x !== 'undefined' && x !== null && x !== ''
const isChecked = (x) => typeof x !== 'undefined' && x !== null && x !== false
const isNumber = (x) => !Number.isNaN(Number.parseFloat(x))

/**
 * Returns a validator that validates using the provided validators and returns the result
 * of the first one to return an error.
 */
export function all(...validators) {
  return (value) => {
    for (let validator of validators) {
      const result = validator(value)
      if (result) {
        return result
      }
    }
  }
}

export function required(errorMessage = 'Required.') {
  return (value) => {
    if (!isProvided(value)) {
      return errorMessage
    }
  }
}

export function checked(errorMessage = 'Required.') {
  return (value) => {
    if (!isChecked(value)) {
      return errorMessage
    }
  }
}

export function number() {
  return (value) => {
    if (isProvided(value) && !isNumber(value)) {
      return 'Must be a number.'
    }
  }
}

export function cannotEqual(x, errorMessage) {
  return (value) => {
    if (isProvided(value) && value === x) {
      return errorMessage || `The value cannot be ${x}.`
    }
  }
}

export function integer() {
  return (value) => {
    if (isProvided(value) && !Number.isInteger(parseFloat(value))) {
      return 'Must be an integer.'
    }
  }
}

function comparative(comparator, x, errorMessage) {
  x = toBigNumber(x)
  return (value) => {
    if (isNumber(value) && !(comparator(toBigNumber(value), x))) {
      return errorMessage
    }
  }
}

export function greaterThan(x, errorMessage = `Must be greater than ${x}`) {
  return comparative((a, b) => a.gt(b), x, errorMessage)
}

export function greaterThanOrEqualTo(x, errorMessage = `Must be at least ${x}`) {
  return comparative((a, b) => a.gte(b), x, errorMessage)
}

export function lessThan(x, errorMessage = `Must be less than ${x}`) {
  return comparative((a, b) => a.lt(b), x, errorMessage)
}

export function lessThanOrEqualTo(x, errorMessage = `Must be at most ${x}`) {
  return comparative((a, b) => a.lte(b), x, errorMessage)
}

export { greaterThan as gt, greaterThanOrEqualTo as gte, lessThan as lt, lessThanOrEqualTo as lte }

function getAddressValidator(asset) {
  const { symbol, ERC20 } = asset
  let networkSymbol = symbol
  if (ERC20) {
    networkSymbol = 'ETH'
  }
  return getDefaultFormat(networkSymbol).validate
}

export function walletAddress(asset, providedError) {
  const validateAddress = getAddressValidator(asset)
  return (value) => {
    if (isProvided(value)) {
      const error = validateAddress(value)
      if (error) {
        return providedError || error
      }
    }
  }
}

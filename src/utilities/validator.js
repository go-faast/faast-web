import web3 from 'Services/Web3'
import { Address } from 'bitcore-lib'

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

export function greaterThan(x) {
  return (value) => {
    if (isNumber(value) && value <= x) {
      return `Must be greater than ${x}`
    }
  }
}

const defaultAddressValidator = () => true

const addressValidators = {
  ETH: web3.utils.isAddress,
  BTC: Address.isValid,
}

function getAddressValidator(asset) {
  const { symbol, ERC20 } = asset
  if (ERC20) {
    return addressValidators.ETH
  }
  return addressValidators[symbol] || defaultAddressValidator
}

export function walletAddress(asset) {
  const { symbol } = asset
  const isValidAddress = getAddressValidator(asset)
  return (value) => {
    if (isProvided(value) && !isValidAddress(value)) {
      return `Invalid ${symbol} address.`
    }
  }
}

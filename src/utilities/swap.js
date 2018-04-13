import { isString, isObject } from 'lodash'

import { toUnit, toPrecision } from 'Utilities/convert'

const createStatus = (code, label) => (detailsCode, details) => ({ code, label, detailsCode, details })

const statusPending = createStatus('pending', 'In progress')
const statusFailed = createStatus('failed', 'Failed')
const statusComplete = createStatus('complete', 'Complete')

export const getSwapStatus = (swap) => {
  const { error, rate, order, tx } = swap
  if (error) {
    if (error.message && error.message.toLowerCase().includes('insufficient funds')) {
      return statusFailed('insufficient_funds', 'insufficient funds')
    }
    return statusFailed('client_error', 'error processing swap')
  }
  if (order == null) {
    return statusPending('creating_order', 'creating swap order')
  }
  if (order.error) {
    return statusFailed('order_error', isString(order.error) ? order.error : 'order error')
  }
  if (order.status === 'failed') {
    return statusFailed('order_failed', 'order was unsuccessful')
  }
  if (order.status === 'cancelled') {
    return statusFailed('order_cancelled', 'order was cancelled')
  }
  if (order.status === 'complete') {
    return statusComplete('order_complete', 'order completed successfully')
  }
  if (rate == null) {
    return statusPending('fetching_rate', 'fetching market info')
  }
  if (tx == null) {
    return statusPending('creating_tx', 'generating transaction')
  }
  if (!tx.id) {
    if (!tx.signedTxData) {
      return statusPending('unsigned', 'waiting for transaction to be signed')
    }
    return statusPending('unsent', 'sending signed transaction')
  }
  if (!tx.receipt) {
    return statusPending('pending_receipt', 'waiting for transaction receipt')
  }
  return statusPending('processing', 'processing swap')
}

export const statusAllSwaps = (swaps) => {
  if (!swaps || !swaps.length) {
    return null
  }
  const statuses = swaps.map(getSwapStatus).map(({ status }) => status)
  if (statuses.includes('failed')) {
    return 'failed'
  }
  if (statuses.includes('pending')) {
    return 'pending'
  }
  if (statuses.every((status) => status === 'complete')) {
    return 'complete'
  }
  return statuses[0]
}

export const getSwapFriendlyError = (swap) => {
  const { error } = swap
  if (!error) return error
  if (isString(error)) {
    return error
  } else if (isObject(error)) {
    const { type, message } = error
    const messageLower = message.toLowerCase()
    if (type === 'swapMarketInfo'
      && (messageLower.includes('minimum') || messageLower.includes('maximum'))) {
      return message
    }
    if (type === 'swapMarketInfo' || type === 'swapPostExchange') {
      return 'swap unavailable at this time'
    }
    if (type === 'swapSufficientFees' || type === 'swapSufficientDeposit') {
      return message
    }
    if (type === 'sendTransaction') {
      return 'error sending deposit tx'
    }
    return 'unknown error'
  }
}

export const estimateReceiveAmount = (swap, asset) => {
  const { fee, rate, sendUnits } = (swap || {})
  if (fee && rate && sendUnits) {
    const converted = toUnit(sendUnits, rate, asset.decimals)
    return toPrecision(converted.minus(fee), asset.decimals)
  }
}

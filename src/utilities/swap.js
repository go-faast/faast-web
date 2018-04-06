import { isString, isObject } from 'lodash'

import { toUnit, toPrecision } from 'Utilities/convert'

export const getSwapStatus = (swap) => {
  const { error, rate, order, tx } = swap
  if (error) {
    if (error.message && error.message.toLowerCase().includes('insufficient funds')) {
      return {
        status: 'error',
        details: 'insufficient funds'
      }
    }
    return {
      status: 'error',
      details: 'unable to send transaction'
    }
  }
  if (rate == null) {
    return {
      status: 'creating',
      details: 'fetching market info'
    }
  }
  if (order == null) {
    return {
      status: 'creating',
      details: 'creating swap order'
    }
  }
  if (tx == null) {
    return {
      status: 'creating',
      details: 'generating transaction'
    }
  }
  if (order.error) {
    return {
      status: 'error',
      details: typeof swap.order.error === 'string' ? swap.order.error : 'swap order error'
    }
  }
  if (order.status === 'complete' || order.status === 'failed') {
    return {
      status: order.status,
      details: order.status
    }
  }
  if (!tx.id) {
    if (!tx.signedTxData) {
      return {
        status: 'unsigned',
        details: 'waiting for transaction to be signed'
      }
    }
    return {
      status: 'unsent',
      details: 'sending signed transaction'
    }
  }
  if (!tx.receipt) {
    return {
      status: 'pending_receipt',
      details: 'waiting for transaction receipt'
    }
  }
  return {
    status: 'processing',
    details: 'processing swap'
  }
}

export const statusAllSwaps = (swaps) => {
  if (!swaps || !swaps.length) {
    return 'unavailable'
  }
  const statuses = swaps.map(getSwapStatus).map(({ status }) => status)
  const statusPriority = [
    'error',
    'failed',
    'unspecified',
    'unsigned',
    'unsent',
    'pending_receipts',
    'pending_receipts_restored'
  ]
  const result = statusPriority.reduce((result, status) => !result && statuses.includes(status) && status, null)
  if (result) {
    return result
  }
  if (statuses.every((status) => status === 'complete')) {
    return 'complete'
  }
  return 'processing'
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

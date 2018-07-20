import { isString } from 'lodash'

import { toUnit, toPrecision } from 'Utilities/convert'

const createStatus = (code, label, labelClass) => (detailsCode, details) => ({ code, label, labelClass, detailsCode, details })

const statusPending = createStatus('pending', 'Processing', 'text-primary')
const statusFailed = createStatus('failed', 'Failed', 'text-warning')
const statusComplete = createStatus('complete', 'Complete', 'text-success')

export const getSwapStatus = (swap) => {
  const {
    error, rate, orderId, order, tx,
    txSigning, txSigned, txSigningError,
    txSending, txSent, txSendingError,
  } = swap
  if (error) {
    if (isString(error) && error.toLowerCase().includes('insufficient funds')) {
      return statusFailed('insufficient_funds', 'Insufficient funds')
    }
    return statusFailed('error', getSwapFriendlyError(swap))
  }
  if (!(order && orderId)) {
    return statusPending('creating_order', 'Creating order')
  }
  if (order.error) {
    return statusFailed('order_error', 'An error occured with this order, please contact support@faa.st')
  }
  if (order.status === 'failed' || order.status === 'cancelled') {
    return statusFailed(`order_${order.status}`, 'Order was unsuccessful, please contact support@faa.st')
  }
  if (order.status === 'complete') {
    return statusComplete('order_complete', 'Order completed successfully')
  }
  if (!rate) {
    return statusPending('fetching_rate', 'Fetching market info')
  }
  if (!(tx && tx.walletId)) {
    return statusPending('creating_tx', 'Generating deposit transaction')
  }
  if (!tx.receipt) {
    if (txSendingError) {
      return statusFailed('send_tx_error', 'Failed to send deposit transaction, please try again')
    }
    if (txSending) {
      return statusPending('sending', 'Sending deposit transaction')
    }
    if (txSent) {
      return statusPending('pending_receipt', 'Waiting for transaction confirmation')
    }
    if (txSigningError) {
      return statusFailed('sign_tx_error', 'Failed to sign deposit transaction, please try again')
    }
    if (txSigning) {
      return statusPending('signing', 'Awaiting signature')
    }
    if (txSigned) {
      return statusPending('signed', 'Ready to send')
    }
    if (!tx.signingSupported) {
      return statusPending('signing_unsupported', 'Ready to send')
    }
    return statusPending('unsigned', 'Ready to sign')
  }
  return statusPending('processing', 'Processing swap')
}

export const statusAllSwaps = (swaps) => {
  if (!swaps || !swaps.length) {
    return null
  }
  const statusCodes = swaps.map(getSwapStatus).map(({ code }) => code)
  if (statusCodes.includes('failed')) {
    return 'failed'
  }
  if (statusCodes.includes('pending')) {
    return 'pending'
  }
  if (statusCodes.every((status) => status === 'complete')) {
    return 'complete'
  }
  return statusCodes[0]
}

export const getSwapFriendlyError = (swap) => {
  const { error, errorType } = swap
  if (!error) return error
  if (isString(error)) {
    if (errorType === 'pollTransactionReceipt') {
      return 'Failed to check deposit transaction status'
    }
    if (errorType === 'sendTransaction') {
      return 'Error sending deposit transaction'
    }
    if (isString(errorType)) {
      return error
    }
  }
  return 'Unknown error'
}

export const estimateReceiveAmount = (swap) => {
  const { fee, rate, sendUnits, receiveAsset } = (swap || {})
  if (fee && rate && sendUnits) {
    const converted = toUnit(sendUnits, rate, receiveAsset.decimals)
    return toPrecision(converted.minus(fee), receiveAsset.decimals)
  }
}

import { isString } from 'lodash'

const createStatus = (code, label, labelClass) => (detailsCode, details) => ({ code, label, labelClass, detailsCode, details })

const statusPending = createStatus('pending', 'Processing', 'text-primary')
const statusFailed = createStatus('failed', 'Failed', 'text-warning')
const statusComplete = createStatus('complete', 'Complete', 'text-success')

export const getSwapStatus = (swap) => {
  const {
    error, rate, orderStatus, tx, createdAt, isManual
  } = swap
  if (error) {
    if (isString(error) && error.toLowerCase().includes('insufficient funds')) {
      return statusFailed('insufficient_funds', 'Insufficient funds')
    }
    return statusFailed('error', getSwapFriendlyError(swap))
  }
  if (orderStatus === 'failed' || orderStatus === 'cancelled') {
    return statusFailed(`order_${orderStatus}`, 'Order was unsuccessful, please contact support@faa.st')
  }
  if (orderStatus === 'complete') {
    return statusComplete('order_complete', 'Order completed successfully')
  }
  if (!rate) {
    return statusPending('fetching_rate', 'Fetching market info')
  }
  if (!isManual) {
    if (!(tx && tx.walletId)) {
      return statusPending('creating_tx', 'Generating deposit transaction')
    }
    if (!tx.receipt) {
      if (tx.sendingError) {
        return statusFailed('send_tx_error', 'Failed to send deposit transaction, please try again')
      }
      if (tx.sending) {
        return statusPending('sending', 'Sending deposit transaction')
      }
      if (tx.sent) {
        return statusPending('pending_receipt', 'Waiting for transaction confirmation')
      }
      if (tx.signingError) {
        return statusFailed('sign_tx_error', 'Failed to sign deposit transaction, please try again')
      }
      if (tx.signing) {
        return statusPending('signing', 'Awaiting signature')
      }
      if (tx.signed) {
        return statusPending('signed', 'Ready to send')
      }
      if (!tx.signingSupported) {
        return statusPending('signing_unsupported', 'Ready to send')
      }
      return statusPending('unsigned', 'Ready to sign')
    }
  } else if (orderStatus === 'awaiting deposit') {
    return statusPending('awaiting_deposit', 'Waiting for deposit')
  }
  const timeSinceCreated = createdAt ? createdAt.getTime() : Date.now()
  if ((Date.now() - timeSinceCreated) / 3600000 >= 4) {
    return statusPending('contact_support', 'There may be an issue. Contact support@faa.st for more info.')
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

export const getSwapRequiresSigning = (swap) => Boolean(swap &&
  !swap.isManual &&
  swap.sendWallet &&
  swap.sendWallet.isSignTxSupported &&
  (swap.tx ? !swap.tx.signed : true))

export const getSwapReadyToSign = (swap) => Boolean(swap) &&
  ['sign_tx_error', 'signing_unsupported', 'unsigned'].includes(swap.status.detailsCode)

export const getSwapReadyToSend = (swap) => Boolean(swap) &&
  ['send_tx_error', 'signing_unsupported', 'signed'].includes(swap.status.detailsCode)

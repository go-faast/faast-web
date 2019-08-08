import { isString } from 'lodash'
import { i18nTranslate as t } from 'Utilities/translate'

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
      return statusFailed('insufficient_funds', t('app.statuses.insufficientFunds', 'Insufficient funds'))
    }
    return statusFailed('error', getSwapFriendlyError(swap))
  }
  if (orderStatus === 'failed' || orderStatus === 'cancelled') {
    return statusFailed(`order_${orderStatus}`, t('app.statuses.unsuccessful', 'Order was unsuccessful, please contact support@faa.st'))
  }
  if (orderStatus === 'complete') {
    return statusComplete('order_complete', t('app.statuses.successful', 'Order completed successfully'))
  }
  if (orderStatus === 'refunded') {
    return statusComplete('order_complete', t('app.statuses.refunded', 'Order Refunded successfully'))
  }
  if (!rate) {
    return statusPending('fetching_rate', t('app.statuses.fetchingRate', 'Fetching market info'))
  }
  if (orderStatus === 'awaiting deposit') {
    if (isManual) {
      return statusPending('awaiting_deposit', t('app.statuses.awaitingDeposit', 'Waiting for deposit'))
    } else {
      if (!(tx && tx.walletId)) {
        return statusPending('creating_tx', t('app.statuses.generateTx', 'Generating deposit transaction'))
      }
      if (!tx.receipt) {
        if (tx.sendingError) {
          return statusFailed('send_tx_error', t('app.statuses.sendTxError', 'Failed to send deposit transaction, please try again'))
        }
        if (tx.sending) {
          return statusPending('sending', t('app.statuses.sending', 'Sending deposit transaction'))
        }
        if (tx.sent) {
          return statusPending('pending_receipt', t('app.statuses.sent', 'Waiting for transaction confirmation'))
        }
        if (tx.signingError) {
          return statusFailed('sign_tx_error', t('app.statuses.signingError', 'Failed to sign deposit transaction, please try again'))
        }
        if (tx.signing) {
          return statusPending('signing', t('app.statuses.signing', 'Awaiting signature'))
        }
        if (tx.signed) {
          return statusPending('signed', t('app.statuses.readyToSend', 'Ready to send'))
        }
        if (!tx.signingSupported) {
          return statusPending('signing_unsupported', t('app.statuses.readyToSend', 'Ready to send'))
        }
        return statusPending('unsigned', t('app.statuses.readyToSign', 'Ready to sign'))
      }
    }
  }

  const timeSinceCreated = createdAt ? new Date(createdAt).getTime() : Date.now()
  if ((Date.now() - timeSinceCreated) / 3600000 >= 4) {
    return statusPending('contact_support', t('app.statuses.contactSupport', 'There may be an issue. Contact support@faa.st for more info.'))
  }
  return statusPending('processing', `${t('app.statuses.processingSwap', 'Processing swap')} (${orderStatus})`)
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
      return t('app.statuses.failedToCheckDepositTx', 'Failed to check deposit transaction status')
    }
    if (errorType === 'sendTransaction') {
      return t('app.statuses.errorSendingDeposit', 'Error sending deposit transaction')
    }
    if (isString(errorType)) {
      return error
    }
  }
  return t('app.statuses.unknownError', 'Unknown error')
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

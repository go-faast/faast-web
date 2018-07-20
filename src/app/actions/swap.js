import { isUndefined, identity } from 'lodash'

import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import {
  toBigNumber,
  toPrecision,
  toUnit,
} from 'Utilities/convert'
import walletService from 'Services/Wallet'

import { getMarketInfo, postExchange, getOrderStatus } from 'Actions/request'
import { getWalletPassword } from 'Actions/walletPasswordPrompt'

import { getAsset, getSwap } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const setSwaps = createAction('SET_ALL')
export const resetSwaps = createAction('RESET_ALL')
export const swapAdded = createAction('ADDED')
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapOrderUpdated = createAction('ORDER_UPDATED', (id, data) => ({ id, order: data }))

export const swapTxUpdated = createAction('TX_UPDATED', (id, data) => ({ id, tx: data }))

export const swapTxSigningStart = createAction('TX_SIGNING_START', (id) => ({ id }))
export const swapTxSigningSuccess = createAction('TX_SIGNING_SUCCESS', (id, updatedTx) => ({ id, tx: updatedTx }))
export const swapTxSigningFailed = createAction('TX_SIGNING_FAILED', (id, errorMessage) => ({ id, signingError: errorMessage }))

export const swapTxSendingStart = createAction('TX_SENDING_START', (id) => ({ id }))
export const swapTxSendingSuccess = createAction('TX_SENDING_SUCCESS', (id, updatedTx) => ({ id, tx: updatedTx }))
export const swapTxSendingFailed = createAction('TX_SENDING_FAILED', (id, errorMessage) => ({ id, sendingError: errorMessage }))

export const addSwap = (swap) => (dispatch) => {
  return dispatch(swapAdded({
    ...swap,
    pair: `${swap.sendSymbol}_${swap.receiveSymbol}`.toLowerCase()
  })).payload
}

export const removeSwap = (swapOrId) => (dispatch) => {
  const id = typeof swapOrId !== 'string' ? swapOrId.id : swapOrId
  dispatch(swapRemoved(id))
}

const createSwapFinish = (dispatch, type, swap, additions) => (errorMessage, moreAdditions) => {
  const updatedFields = {}
  if (errorMessage) {
    updatedFields.error = errorMessage
    updatedFields.errorType = type
  }
  if (additions) {
    Object.assign(updatedFields, additions)
  }
  if (moreAdditions) {
    Object.assign(updatedFields, moreAdditions)
  }
  if (updatedFields && Object.keys(updatedFields).length > 0) {
    dispatch(swapUpdated(swap.id, updatedFields))
    return { ...swap, ...updatedFields }
  }
  return swap
}

export const updateMarketInfo = (swap) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const { sendSymbol, sendUnits, receiveSymbol, pair } = swap
  const newFields = {}
  const finish = createSwapFinish(dispatch, 'updateMarketInfo', swap, newFields)
  if (sendSymbol === receiveSymbol) return finish('cannot swap to same asset')

  return dispatch(getMarketInfo(pair))
    .then((res) => {
      log.debug('marketinfo response', res)
      if (!res.pair) {
        return finish('Error getting market info')
      }
      if (res.hasOwnProperty('rate')) {
        newFields.rate = toBigNumber(res.rate)
      } else {
        return finish('Error getting market rate')
      }
      if (res.hasOwnProperty('outgoing_network_fee')) {
        newFields.fee = toBigNumber(res.outgoing_network_fee)
      } else if (res.hasOwnProperty('minerFee')) {
        newFields.fee = toBigNumber(res.minerFee)
      } else {
        return finish('Error getting swap fee')
      }
      if (res.hasOwnProperty('minimum') && sendUnits.lessThan(res.minimum)) {
        return finish(`Minimum amount is ${res.minimum} ${sendSymbol}`)
      }
      if (res.hasOwnProperty('min') && sendUnits.lessThan(res.min)) {
        return finish(`Minimum amount is ${res.min} ${sendSymbol}`)
      }
      if ((res.hasOwnProperty('limit') && sendUnits.greaterThan(res.limit)) || (res.maxLimit && sendUnits.greaterThan(res.maxLimit))) {
        return finish(`Maximum amount is ${res.limit} ${sendSymbol}`)
      }
      return finish()
    })
    .catch((e) => {
      log.error(e)
      return finish('Error getting market info')
    })
})

// Checks to see if the deposit is high enough for the rate and swap fee
// so the expected amount ends up larger than zero
export const checkSufficientDeposit = (swap) => (dispatch, getState) => {
  if (swap.error) return swap
  const { sendUnits, receiveSymbol, rate, fee } = swap
  const finish = createSwapFinish(dispatch, 'checkSufficientDeposit', swap)
  const receiveAsset = getAsset(getState(), receiveSymbol)
  const expected = toPrecision(toUnit(sendUnits, rate, receiveAsset.decimals).minus(fee), receiveAsset.decimals)
  if (expected.lessThanOrEqualTo(0)) {
    return finish('Estimated amount to receive is below 0')
  }
  return finish()
}

export const createOrder = (swap) => (dispatch) => {
  if (swap.error) return swap
  const finish = createSwapFinish(dispatch, 'createOrder', swap)
  const finishErrorHandler = (message) => (e) => {
    log.error(e)
    return finish(message)
  }
  const { sendWalletId, sendSymbol, receiveWalletId, receiveSymbol, pair } = swap
  const sendWalletInstance = walletService.get(sendWalletId)
  const receiveWalletInstance = walletService.get(receiveWalletId)
  return Promise.all([
    sendWalletInstance.getFreshAddress(sendSymbol),
    receiveWalletInstance.getFreshAddress(receiveSymbol),
  ])
  .catch(finishErrorHandler('Error retrieving wallet addresses'))
  .then(([returnAddress, withdrawalAddress]) => dispatch(postExchange({
    pair,
    withdrawal: withdrawalAddress,
    returnAddress,
  })))
  .catch(finishErrorHandler('Error creating swap orders'))
  .then((order) => finish(null, { order }))
}

const createTransferEventListeners = (swap) => (dispatch) => {
  const { id: swapId } = swap
  let txId
  return {
    onTxHash: (txHash) => {
      log.info(`tx hash ${txHash} obtained for swap ${swapId}`)
      txId = txHash
      dispatch(swapTxUpdated(swapId, { id: txId }))
    },
    onReceipt: (receipt) => {
      log.info(`tx receipt obtained for swap ${swapId}`)
      dispatch(swapTxUpdated(swapId, { receipt }))
    },
    onConfirmation: (conf) => {
      dispatch(swapTxUpdated(swapId, { confirmations: conf }))
    }
  }
}

export const createSwapTx = (swap, walletPreviousEthTx = {}) => (dispatch) => {
  log.debug('createSwapTx', swap)
  const { order, sendUnits, sendSymbol, sendWalletId } = swap
  const walletInstance = walletService.get(sendWalletId)
  if (!walletInstance) {
    throw new Error(`Cannot get wallet ${sendWalletId}`)
  }
  const finish = createSwapFinish(dispatch, 'createSwapTx', swap)
  return walletInstance.createTransaction(order.deposit, sendUnits, sendSymbol, { previousTx: walletPreviousEthTx[sendWalletId] })
    .then((tx) => {
      if (tx.feeSymbol === 'ETH') {
        walletPreviousEthTx[sendWalletId] = tx
      }
      return finish(null, { sendUnits: tx.amount, tx })
    })
  .catch((e) => {
    log.error(e)
    return finish('Error generating deposit txn')
  })
}

export const initiateSwap = (swap) => (dispatch) => {
  return dispatch(updateMarketInfo(swap))
    .then((s) => dispatch(checkSufficientDeposit(s)))
    .then((s) => dispatch(createOrder(s)))
    .then((s) => dispatch(createSwapTx(s)))
}

const createSwapErrorHandler = (dispatch, swap, methodName, failureAction, filterMessage = identity) => (e) => {
  log.error(`${methodName} error for swap ${swap.id}`, e)
  const message = filterMessage(e.message)
  if (!message) {
    return swap
  }
  dispatch(failureAction(swap.id, message))
  if (message !== e.message) {
    throw new Error(message)
  }
  throw e
}

export const signSwap = (swap, passwordCache = {}) => (dispatch) => {
  log.debug('signSwap', swap)
  const { id, tx, sendWalletId } = swap
  const walletInstance = walletService.get(sendWalletId)
  if (!walletInstance.isSignTransactionSupported()) {
    return
  }
  dispatch(swapTxSigningStart(id))

  const passwordPromise = (isUndefined(passwordCache[sendWalletId]) && walletInstance.isPasswordProtected())
    ? dispatch(getWalletPassword(sendWalletId))
    : Promise.resolve(passwordCache[sendWalletId])

  return passwordPromise
    .then((password) => {
      passwordCache[sendWalletId] = password
      return walletInstance.signTransaction(tx, { password })
    })
    .then((signedTx) => dispatch(swapTxSigningSuccess(id, signedTx)).payload)
    .catch(createSwapErrorHandler(dispatch, swap, 'signSwap', swapTxSigningFailed))
}

export const sendSwap = (swap, sendOptions) => (dispatch) => {
  log.debug('sendSwap', swap)
  const { id, tx, sendWalletId } = swap
  const eventListeners = dispatch(createTransferEventListeners(swap))
  const walletInstance = walletService.get(sendWalletId)
  dispatch(swapTxSendingStart(id))

  return walletInstance.sendTransaction(tx, { ...eventListeners, ...sendOptions })
    .then((sentTx) => {
      dispatch(pollTransactionReceipt(swap))
      dispatch(pollOrderStatus(swap))
      return dispatch(swapTxSendingSuccess(id, sentTx)).payload
    })
    .catch(createSwapErrorHandler(dispatch, swap, 'sendSwap', swapTxSendingFailed, (message) => {
      if (message.includes('User denied transaction signature')) {
        return 'Transaction was rejected'
      }
      return message.replace('Returned error: ', '')
    }))
}

const updateOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`updateOrderStatus: swap ${id} has no orderId`)
    return
  }
  return dispatch(getOrderStatus(orderId))
    .then((order) => {
      dispatch(swapOrderUpdated(id, order))
      return order
    })
    .catch(log.error)
}

const isOrderFinalized = (order) => order && (order.status === 'complete' || order.status === 'failed')

export const pollOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`pollOrderStatus: swap ${id} has no orderId`)
    return
  }
  const orderStatusInterval = window.setInterval(() => {
    dispatch(updateOrderStatus(swap))
      .then((order) => {
        if (isOrderFinalized(order)) {
          clearInterval(orderStatusInterval)
        }
      })
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

const updateSwapTxReceipt = (swap) => (dispatch) => {
  const { id, tx, sendWalletId } = swap
  const walletInstance = walletService.get(sendWalletId)
  if (!walletInstance) {
    log.error(`Failed to get swap sendWallet ${sendWalletId}`)
    return
  }
  return walletInstance.getTransactionReceipt(tx)
    .then((receipt) => {
      if (receipt) {
        log.info('tx receipt obtained')
        dispatch(swapTxUpdated(id, { receipt }))
      }
      return receipt
    })
    .catch((e) => log.error(`failed to get swap ${id} transaction receipt`, e))
}

export const pollTransactionReceipt = (swap) => (dispatch) => {
  const { id: swapId, tx: { id: txId } } = swap
  if (!txId) {
    log.info(`pollTransactionReceipt: swap ${swapId} has no txId`)
    return
  }
  const receiptInterval = window.setInterval(() => {
    dispatch(updateSwapTxReceipt(swap))
      .then((receipt) => {
        if (receipt && receipt.confirmed) {
          clearInterval(receiptInterval)
        }
      })
  }, 5000)

  window.faast.intervals.txReceipt.push(receiptInterval)
}

export const restoreSwapPolling = (swap) => (dispatch, getState) => {
  if (!swap) {
    return
  }
  return Promise.all([
    updateSwapTxReceipt(swap),
    updateOrderStatus(swap)
  ]).then(() => {
    swap = getSwap(getState(), swap.id)
    const { status, order } = swap
    if (status.detailsCode === 'pending_receipt') {
      dispatch(pollTransactionReceipt(swap))
    }
    if (!isOrderFinalized(order)) {
      dispatch(pollOrderStatus(swap))
    }
  })
}

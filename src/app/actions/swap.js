import { isObject } from 'lodash'
import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import { toBigNumber } from 'Utilities/convert'
import walletService from 'Services/Wallet'

import Faast from 'Services/Faast'
import { createTx, signTx, sendTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'

import { getSwap, getTx } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const swapsRestored = createAction('RESTORED')
export const resetSwaps = createAction('RESET_ALL')
export const swapAdded = createAction('ADDED')
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapOrderUpdated = createAction('ORDER_UPDATED', (id, data) => ({ id, order: data }))
export const swapError = createAction('ERROR', (id, error, errorType = '') => ({ id, error, errorType }))
export const swapOrderStatusUpdated = createAction('ORDER_STATUS_UPDATED', (id, orderStatus) => ({ id, orderStatus }))

export const restoreSwaps = (swaps) => (dispatch) => {
  return dispatch(swapsRestored((isObject(swaps) ? Object.values(swaps) : swaps)
    .map((s) => {
      const v = s.v || '1'
      const createdAt = s.createdAt || s.order.created
      const rate = v === '1' ? toBigNumber(s.rate).pow(-1) : toBigNumber(s.rate)
      const sendUnits = toBigNumber(s.sendUnits)
      const receiveUnits = s.receiveUnits ? toBigNumber(s.receiveUnits) : sendUnits.div(rate)
      return {
        ...s,
        rate,
        sendUnits,
        receiveUnits,
        depositAddress: s.depositAddress || s.order.deposit || s.order.depositAddress || s.order.address || '',
        createdAt: createdAt ? new Date(createdAt) : new Date(0),
        orderStatus: s.orderStatus || s.order.status || '',
      }
    })))
}

export const addSwap = (swap) => (dispatch) => {
  return dispatch(swapAdded(swap)).payload
}

export const removeSwap = (swapOrId) => (dispatch) => {
  const id = typeof swapOrId !== 'string' ? swapOrId.id : swapOrId
  dispatch(swapRemoved(id))
}

const createSwapFinish = (type, swap) => (dispatch, getState) => (errorMessage, updatedFields) => {
  if (errorMessage) {
    dispatch(swapError(swap.id, errorMessage, type))
  }
  if (updatedFields && Object.keys(updatedFields).length > 0) {
    dispatch(swapUpdated(swap.id, updatedFields))
  }
  return getSwap(getState(), swap.id)
}

export const createOrder = (swap) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const finish = dispatch(createSwapFinish('createOrder', swap))
  const { sendWalletId, sendUnits, sendSymbol, receiveWalletId, receiveSymbol, pair } = swap
  const sendWalletInstance = walletService.get(sendWalletId)
  const receiveWalletInstance = walletService.get(receiveWalletId)
  return Promise.all([
    sendWalletInstance.getFreshAddress(sendSymbol),
    receiveWalletInstance.getFreshAddress(receiveSymbol),
    receiveWalletInstance.getUserId(sendSymbol),
  ])
  .then(([refundAddress, receiveAddress, userId]) => Faast.postFixedPriceSwap(
    sendUnits.toNumber(),
    sendSymbol,
    receiveAddress,
    receiveSymbol,
    refundAddress,
    userId,
  ))
  .then((order) => finish(null, {
    order,
    createdAt: order.createdAt,
    rate: toBigNumber(order.rate),
    depositAddress: order.depositAddress,
    receiveUnits: toBigNumber(order.receiveAmount),
  }))
  .catch((e) => {
    log.error('createOrder', e)
    return finish(`Error creating swap for pair ${pair}, please contact support@faa.st`)
  })
})

export const setSwapTx = (swapId, tx, outputIndex = 0) => (dispatch) => {
  dispatch(swapUpdated(swapId, { sendUnits: tx.outputs[outputIndex].amount, txId: tx.id }))
}

export const createSwapTx = (swap, options) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  log.debug('createSwapTx', swap)
  const { sendUnits, sendSymbol, sendWalletId, depositAddress } = swap
  const finish = dispatch(createSwapFinish('createSwapTx', swap))
  return dispatch(createTx(sendWalletId, depositAddress, sendUnits, sendSymbol, options))
    .then((tx) => {
      dispatch(setSwapTx(swap.id, tx))
      return tx
    })
    .catch((e) => {
      log.error('createSwapTx', e)
      return finish('Error creating deposit transaction')
    })
})

export const initiateSwap = (swap) => (dispatch, getState) => {
  return dispatch(createOrder(swap))
    .then((s) => dispatch(createSwapTx(s)))
    .then(() => getSwap(getState(), swap.id))
}

export const signSwap = (swap, passwordCache = {}) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    log.debug('signSwap', swap)
    const { txId } = swap
    const tx = getTx(getState(), txId)
    if (tx.signed) {
      return
    }
    return dispatch(signTx(tx, passwordCache))
  })

export const sendSwap = (swap, sendOptions) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    log.debug('sendSwap', swap)
    const { txId } = swap
    const tx = getTx(getState(), txId)
    if (tx.sent) {
      return
    }
    return dispatch(sendTx(tx, sendOptions))
  })
  .then(() => dispatch(pollOrderStatus(swap)))

const updateOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`updateOrderStatus: swap ${id} has no orderId`)
    return
  }
  return Faast.fetchOrderStatus(orderId)
    .then((order) => {
      dispatch(swapOrderStatusUpdated(id, order.status))
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

export const restoreSwapPolling = (swap) => (dispatch, getState) => {
  if (!swap) {
    return
  }
  return Promise.all([
    updateTxReceipt(swap.txId),
    updateOrderStatus(swap)
  ]).then(() => {
    swap = getSwap(getState(), swap.id)
    const { status, order } = swap
    if (status.detailsCode === 'pending_receipt') {
      dispatch(pollTxReceipt(swap.txId))
    }
    if (!isOrderFinalized(order) && swap.tx.sent) {
      dispatch(pollOrderStatus(swap))
    }
  })
}

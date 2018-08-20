import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import {
  toBigNumber,
  toPrecision,
  toUnit,
} from 'Utilities/convert'
import walletService from 'Services/Wallet'

import { getMarketInfo, postExchange, getOrderStatus } from 'Actions/request'
import { createTx, signTx, sendTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'

import { getAsset, getSwap, getTx } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const swapsRestored = createAction('RESTORED')
export const resetSwaps = createAction('RESET_ALL')
export const swapAdded = createAction('ADDED')
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapOrderUpdated = createAction('ORDER_UPDATED', (id, data) => ({ id, order: data }))

export const addSwap = (swap) => (dispatch) => {
  return dispatch(swapAdded(swap)).payload
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
    swap = { ...swap, ...updatedFields }
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
export const checkSufficientDeposit = (swap) => (dispatch, getState) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const { sendUnits, receiveSymbol, rate, fee } = swap
  const finish = createSwapFinish(dispatch, 'checkSufficientDeposit', swap)
  const receiveAsset = getAsset(getState(), receiveSymbol)
  const expected = toPrecision(toUnit(sendUnits, rate, receiveAsset.decimals).minus(fee), receiveAsset.decimals)
  if (expected.lessThanOrEqualTo(0)) {
    return finish('Estimated amount to receive is below 0')
  }
  return finish()
})

export const createOrder = (swap) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const finish = createSwapFinish(dispatch, 'createOrder', swap)
  const { sendWalletId, sendSymbol, receiveWalletId, receiveSymbol, pair } = swap
  const sendWalletInstance = walletService.get(sendWalletId)
  const receiveWalletInstance = walletService.get(receiveWalletId)
  return Promise.all([
    sendWalletInstance.getFreshAddress(sendSymbol),
    receiveWalletInstance.getFreshAddress(receiveSymbol),
  ])
  .then(([returnAddress, withdrawalAddress]) => dispatch(postExchange({
    pair,
    withdrawal: withdrawalAddress,
    returnAddress,
  })))
  .then((order) => finish(null, { order }))
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
  const { order, sendUnits, sendSymbol, sendWalletId } = swap
  const finish = createSwapFinish(dispatch, 'createSwapTx', swap)
  return dispatch(createTx(sendWalletId, order.deposit, sendUnits, sendSymbol, options))
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
  return dispatch(updateMarketInfo(swap))
    .then((s) => dispatch(checkSufficientDeposit(s)))
    .then((s) => dispatch(createOrder(s)))
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

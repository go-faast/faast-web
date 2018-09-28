import { flatten } from 'lodash'
import { toNumber } from 'Utilities/convert'

import { newScopedCreateAction, idPayload } from 'Utilities/action'
import log from 'Log'
import walletService, { MultiWallet } from 'Services/Wallet'
import Faast from 'Services/Faast'

import { createTx, signTx, sendTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'
import { defaultPortfolioId } from 'Actions/portfolio'

import { getSwap, getTx, getWallet } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const resetSwaps = createAction('RESET_ALL')
export const swapsRetrieved = createAction('RESTORED')
export const swapAdded = createAction('ADDED')
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapError = createAction('ERROR', (id, error, errorType = '') => ({ id, error, errorType }))
export const swapOrderStatusUpdated = createAction('STATUS_UPDATED', (id, status) => ({ id, orderStatus: status }))
export const swapTxIdUpdated = createAction('TX_ID_UPDATED', (id, txId) => ({ id, txId }))

export const addManualProperty = createAction('ADD_MANUAL_PROPERTY', idPayload)
export const swapInitStarted = createAction('INIT_STARTED', idPayload)
export const swapInitSuccess = createAction('INIT_SUCCESS', idPayload)
export const swapInitFailed = createAction('INIT_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))

export const retrieveSwaps = (walletId) => (dispatch, getState) => {
  const wallet = getWallet(getState(), walletId)
  if (!wallet) { return }
  if (wallet.type.includes(MultiWallet.type)) {
    return Promise.all(wallet.nestedWalletIds.map((nestedWalletId) => dispatch(retrieveSwaps(nestedWalletId))))
      .then(flatten)
  }
  return Faast.fetchOrders(walletId)
    .then((orders) => dispatch(swapsRetrieved(orders)).payload)
}

export const retrieveAllSwaps = () => (dispatch) => {
  return dispatch(retrieveSwaps(defaultPortfolioId))
}

export const restoreSwapTxIds = (swapIdToTxId) => (dispatch) => {
  Object.entries(swapIdToTxId).forEach(([swapId, txId]) => dispatch(swapTxIdUpdated(swapId, txId)))
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

const getWalletForAsset = (walletId, assetSymbol) => {
  const walletInstance = walletService.get(walletId)
  if (walletInstance instanceof MultiWallet) {
    return walletInstance.getWalletForAsset(assetSymbol)
  }
  return walletInstance
}

export const createOrder = (swap) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const finish = dispatch(createSwapFinish('createOrder', swap))
  const { sendWalletId, sendAmount, sendSymbol, receiveWalletId, receiveSymbol } = swap
  const sendWalletInstance = getWalletForAsset(sendWalletId, sendSymbol)
  const receiveWalletInstance = getWalletForAsset(receiveWalletId, receiveSymbol)
  const userId = sendWalletInstance.getId()
  return Promise.all([
    sendWalletInstance.getFreshAddress(sendSymbol),
    receiveWalletInstance.getFreshAddress(receiveSymbol),
  ])
  .then(([refundAddress, receiveAddress]) => Faast.postFixedPriceSwap(
    toNumber(sendAmount),
    sendSymbol,
    receiveAddress,
    receiveSymbol,
    refundAddress,
    userId,
  ))
  .then((order) => finish(null, order))
  .catch((e) => {
    log.error('createOrder', e)
    return finish(`Error creating swap for pair ${sendSymbol}->${receiveSymbol}, please contact support@faa.st`)
  })
})

export const createManualOrder = (swap) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  const finish = dispatch(createSwapFinish('createOrder', swap))
  const { receiveAddress, refundAddress, sendAmount, sendSymbol, receiveSymbol } = swap
  return Faast.postFixedPriceSwap(
    toNumber(sendAmount),
    sendSymbol,
    receiveAddress,
    receiveSymbol,
    refundAddress,
  )
  .then((order) => { 
    finish(null, order)
    return order
  })
  .catch((e) => {
    log.error('createManualOrder', e)
    return finish(`Error creating manual swap for pair ${sendSymbol}->${receiveSymbol}, please contact support@faa.st`)
  })
})

export const setSwapTx = (swapId, tx, outputIndex = 0) => (dispatch) => {
  dispatch(swapUpdated(swapId, { sendAmount: tx.outputs[outputIndex].amount, txId: tx.id }))
}

export const createSwapTx = (swap, options) => (dispatch) => Promise.resolve().then(() => {
  if (swap.error) return swap
  log.debug('createSwapTx', swap)
  const { sendAmount, sendSymbol, sendWalletId, depositAddress } = swap
  const finish = dispatch(createSwapFinish('createSwapTx', swap))
  return dispatch(createTx(sendWalletId, depositAddress, sendAmount, sendSymbol, options))
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
  dispatch(swapInitStarted(swap.id))
  return dispatch(createOrder(swap))
    .then((s) => dispatch(createSwapTx(s)))
    .then(() => dispatch(swapInitSuccess(swap.id)))
    .then(() => getSwap(getState(), swap.id))
    .catch((e) => dispatch(swapInitFailed(swap.id, e.message || e)))
}

export const createManualSwap = (swap) => (dispatch, getState) => {
  let swapId = ''
  dispatch(swapInitStarted(swap.id))
  return dispatch(createManualOrder(swap))
    .then((s) => { 
      swapId = s.orderId 
      return dispatch(swapAdded(s))
    })
    .then(() => dispatch(addManualProperty(swapId)))
    .then(() => dispatch(swapInitSuccess(swapId)))
    .then(() => getSwap(getState(), swapId))
    .catch((e) => dispatch(swapInitFailed(swapId, e.message || e)))
}

export const fetchManualSwap = (swapId) => (dispatch, getState) => {
  return Faast.fetchSwap(swapId)
    .then((swap) => { 
      dispatch(pollOrderStatus(swap))
      return dispatch(swapAdded(swap))
    })
    .then(() => dispatch(addManualProperty(swapId)))
    .then(() => getSwap(getState(), swapId))
    .catch((e) => dispatch(swapInitFailed(swapId, e.message || e)))
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

const isSwapFinalized = (swap) => swap && (swap.orderStatus === 'complete' || swap.orderStatus === 'failed')

export const pollOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`pollOrderStatus: swap ${id} has no orderId`)
    return
  }
  const orderStatusInterval = window.setInterval(() => {
    dispatch(updateOrderStatus(swap))
      .then((order) => {
        if (isSwapFinalized(order)) {
          clearInterval(orderStatusInterval)
        }
      })
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

export const restoreSwapPolling = (swapId) => (dispatch, getState) => {
  let swap = getSwap(getState(),  swapId)
  if (!swap) {
    log.debug(`restoreSwapPolling: could not find swap ${swapId}`)
    return
  }
  return Promise.all([
    updateTxReceipt(swap.txId),
    updateOrderStatus(swap)
  ]).then(() => {
    swap = getSwap(getState(), swap.id)
    const { orderStatus, tx } = swap
    if (tx.sent && !tx.receipt) {
      dispatch(pollTxReceipt(swap.txId))
    }
    if (!isSwapFinalized(swap) && (orderStatus !== 'awaiting deposit' || tx.sent)) {
      dispatch(pollOrderStatus(swap))
    }
  })
}

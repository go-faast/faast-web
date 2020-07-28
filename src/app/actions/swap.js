import { flatten } from 'lodash'

import { MultiWallet } from 'Services/Wallet'
import { newScopedCreateAction } from 'Utilities/action'
import log from 'Log'
import Faast from 'Services/Faast'
import toastr from 'Utilities/toastrWrapper'

import { signTx, sendTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'
import { defaultPortfolioId } from 'Actions/portfolio'
import { walletOrdersLoading, walletOrdersLoaded, walletOrdersAllLoaded } from 'Actions/wallet'

import { getSwap, getTx, getWallet } from 'Selectors'
import { swapUpdated, swapAdded, createSwapTx } from 'Common/actions/swap'

export * from 'Common/actions/swap'

const createAction = newScopedCreateAction(__filename)

export const resetSwaps = createAction('RESET_ALL')
export const swapsRetrieved = createAction('RETRIEVED', (orders) => orders, (_, walletId) => ({ walletId }))
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapOrderStatusUpdated = createAction('STATUS_UPDATED', (id, status) => ({ id, orderStatus: status }))
export const swapTxIdUpdated = createAction('TX_ID_UPDATED', (id, txId) => ({ id, txId }))

export const retrieveSwaps = (walletId, page, limit) => (dispatch, getState) => {
  const wallet = getWallet(getState(), walletId)
  if (!wallet) {
    log.warn(`Cannot retrieve swaps for unknown wallet ${walletId}`)
    return
  }
  if (wallet.type.includes(MultiWallet.type)) {
    return Promise.all(wallet.nestedWalletIds.map((nestedWalletId) => dispatch(retrieveSwaps(nestedWalletId, page, limit))))
      .then(flatten)
  }
  dispatch(walletOrdersLoading(walletId))
  return Faast.fetchOrders(walletId, page, limit)
    .then((orders) => { 
      if (orders.length == 0) {
        dispatch(walletOrdersAllLoaded(walletId))
      }
      dispatch(walletOrdersLoaded(walletId))
      return dispatch(swapsRetrieved(orders, walletId)).payload
    })
}

export const retrieveAllSwaps = () => (dispatch) => {
  return dispatch(retrieveSwaps(defaultPortfolioId))
}

export const retrievePaginatedSwaps = (page, limit) => (dispatch) => {
  return dispatch(retrieveSwaps(defaultPortfolioId, page, limit))
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

export const ensureSwapTxCreated = (swap, options) => (dispatch) => Promise.resolve().then(() => {
  if (swap && !swap.txId && swap.sendWalletId) {
    options = {
      ...options,
      extraId: swap.depositAddressExtraId
    }
    return dispatch(createSwapTx(swap, options))
  }
})

export const retrieveSwap = (swapOrderId) => (dispatch, getState)  => Promise.resolve()
  .then(() => {
    return Faast.fetchSwap(swapOrderId)
      .then((swap) => {
        const existingSwap = getSwap(getState(), swapOrderId)
        swap.id = existingSwap ? existingSwap.id : swap.orderId
        dispatch(swapAdded(swap))
        dispatch(pollOrderStatus(swap))
        return getSwap(getState(), swap.id)
      })
      .catch((e) => {
        log.error(`Failed to retrieve swap ${swapOrderId}`, e)
        toastr.error(`Failed to retrieve swap ${swapOrderId}`)
        throw e
      })
  })

export const refreshSwap = (swapOrderId) => (dispatch, getState) => {
  return Faast.refreshSwap(swapOrderId)
    .then((swap) => {
      const existingSwap = getSwap(getState(), swapOrderId)
      swap.id = existingSwap ? existingSwap.id : swap.orderId
      dispatch(swapUpdated(swap.id, swap))
    })
    .catch((e) => {
      log.error(`Failed to refresh swap ${swapOrderId}`, e)
      toastr.error(`Failed to refresh swap ${swapOrderId}`)
      throw e
    })
}

export const signSwap = (swap, passwordCache = {}) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    log.debug('signSwap', swap)
    const { txId } = swap
    const tx = getTx(getState(), txId)
    if (tx && tx.signed) {
      return
    }
    return dispatch(signTx(tx, passwordCache))
  })
  .then(() => getSwap(getState(), swap.id))

export const sendSwap = (swap, sendOptions) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    log.debug('sendSwap', swap)
    const { txId } = swap
    const tx = getTx(getState(), txId)
    if (tx && tx.sent) {
      return
    }
    return dispatch(sendTx(tx, sendOptions))
      .then((sentTx) => {
        if (sentTx && sentTx.sent && sentTx.hash) {
          return Faast.provideSwapDepositTx(swap.orderId, sentTx.hash)
        }
      })
  })
  .then(() => {
    const updatedSwap = getSwap(getState(), swap.id)
    return dispatch(pollOrderStatus(updatedSwap)) 
  })
  .then(() => getSwap(getState(), swap.id))

const updateOrderStatus = (swap) => (dispatch) => {
  const { id, orderId, orderStatus } = swap
  if (!orderId) {
    log.info(`updateOrderStatus: swap ${id} has no orderId`)
    return
  }
  return Faast.fetchSwap(orderId)
    .then((order) => {
      if (order.orderStatus !== orderStatus) {
        dispatch(swapOrderStatusUpdated(id, order.orderStatus))
      }
      return order
    })
    .catch(log.error)
}

const isSwapFinalized = (swap) => swap && (swap.orderStatus === 'complete' || swap.orderStatus === 'failed' || swap.orderStatus === 'cancelled')

export const pollOrderStatus = (swap) => (dispatch) => {
  const { id, orderId, orderStatus, tx, errorType } = swap
  if (!orderId) {
    log.warn(`pollOrderStatus: swap ${id} has no orderId`)
    return
  }
  if (isSwapFinalized(swap)) {
    // log.debug(`pollOrderStatus: swap ${id} is finalized, won't poll`)
    return
  }
  if (orderStatus === 'awaiting deposit' && (errorType === 'createSwapTx' || (tx && !tx.sent))) {
    // log.debug(`pollOrderStatus: swap ${id} has unsent tx, won't poll`)
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
    swap.txId ? updateTxReceipt(swap.txId) : null,
    updateOrderStatus(swap)
  ]).then(() => {
    swap = getSwap(getState(), swap.id)
    const { tx } = swap
    if (tx && tx.sent && !tx.receipt) {
      dispatch(pollTxReceipt(swap.txId))
        .then(() => {
          Faast.provideSwapDepositTx(swap.orderId, tx.hash)
          return pollOrderStatus(swap)
        })
    } else {
      dispatch(pollOrderStatus(swap))
    }
  })
}

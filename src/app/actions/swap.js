import { flatten } from 'lodash'
import uuid from 'uuid/v4'

import { toNumber, toBigNumber } from 'Utilities/convert'
import { MultiWallet } from 'Services/Wallet'
import { newScopedCreateAction, idPayload } from 'Utilities/action'
import { getWalletForAsset } from 'Utilities/wallet'
import log from 'Log'
import Faast from 'Services/Faast'
import toastr from 'Utilities/toastrWrapper'

import { createTx, signTx, sendTx, updateTxReceipt, pollTxReceipt } from 'Actions/tx'
import { defaultPortfolioId } from 'Actions/portfolio'
import { retrievePairData } from 'Actions/rate'
import { walletOrdersLoading, walletOrdersLoaded, walletOrdersAllLoaded } from 'Actions/wallet'

import { getSwap, getTx, getWallet } from 'Selectors'

/** A special value passed to the backend when not sending/receiving from a connected wallet */
const EXTERNAL_WALLET_TYPE = 'External'

const createAction = newScopedCreateAction(__filename)

export const resetSwaps = createAction('RESET_ALL')
export const swapsRetrieved = createAction('RETRIEVED', (orders) => orders, (_, walletId) => ({ walletId }))
export const swapAdded = createAction('ADDED')
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapError = createAction('ERROR', (id, error, errorType = '') => ({ id, error, errorType }))
export const swapOrderStatusUpdated = createAction('STATUS_UPDATED', (id, status) => ({ id, orderStatus: status }))
export const swapTxIdUpdated = createAction('TX_ID_UPDATED', (id, txId) => ({ id, txId }))

export const swapInitStarted = createAction('INIT_STARTED', idPayload)
export const swapInitSuccess = createAction('INIT_SUCCESS', idPayload)
export const swapInitFailed = createAction('INIT_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))

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

const createSwapFinish = (type, swap) => (dispatch, getState) => (errorMessage, updatedFields) => {
  if (errorMessage) {
    dispatch(swapError(swap.id, errorMessage, type))
  }
  if (updatedFields && Object.keys(updatedFields).length > 0) {
    dispatch(swapUpdated(swap.id, updatedFields))
  }
  return getSwap(getState(), swap.id)
}

const getFreshAddress = (walletInstance, symbol) => walletInstance
  ? walletInstance.getFreshAddress(symbol)
  : undefined

const getMetaWalletType = (walletInstance) => {
  if (!walletInstance) {
    return EXTERNAL_WALLET_TYPE
  }
  const type = walletInstance.getType()
  if (walletInstance.providerName) {
    return `${type}_${walletInstance.providerName}`
  }
  return type
}

export const createOrder = (swap) => (dispatch) => {
  if (!swap) {
    log.error(`Cannot create swap order for ${swap}`)
    return
  }
  const { id, sendAmount, sendSymbol, receiveSymbol, sendWalletId, receiveWalletId, receiveAmount: withdrawalAmount, extraWithdrawalField, refundAddressExtraId } = swap
  return Promise.resolve().then(() => {
    if (swap.error) return swap
    const finish = dispatch(createSwapFinish('createOrder', swap))
    return dispatch(retrievePairData(sendSymbol, receiveSymbol, sendAmount, withdrawalAmount))
      .then((pairData) => {
        if (sendAmount) {
          const minDeposit = toBigNumber(pairData.minimum_deposit)
          const maxDeposit = toBigNumber(pairData.maximum_deposit)
          if (minDeposit.gt(sendAmount)) {
            return finish(`Send amount must be at least ${minDeposit} ${sendSymbol}`)
          }
          if (sendAmount.gt(maxDeposit)) {
            return finish(`Send amount cannot be greater than ${maxDeposit} ${sendSymbol} to ensure efficient pricing.`)
          }
        }
        if (!receiveWalletId && !swap.receiveAddress) {
          throw new Error('Must specify receive wallet or receive address')
        }
        const sendWalletInstance = sendWalletId ? getWalletForAsset(sendWalletId, sendSymbol) : null
        const receiveWalletInstance = receiveWalletId ? getWalletForAsset(receiveWalletId, receiveSymbol) : null
        const userId = sendWalletInstance ? sendWalletInstance.getId() : undefined
        const sendWalletType = getMetaWalletType(sendWalletInstance)
        const receiveWalletType = getMetaWalletType(receiveWalletInstance)
        log.info(`Creating faast order for swap ${id}`)
        return Promise.all([
          swap.receiveAddress || getFreshAddress(receiveWalletInstance, receiveSymbol),
          swap.refundAddress || getFreshAddress(sendWalletInstance, sendSymbol),
        ]).then(([receiveAddress, refundAddress]) => Faast.createNewOrder({
          sendSymbol,
          receiveSymbol,
          receiveAddress,
          extraWithdrawalField, // optional
          refundAddressExtraId, // optional
          withdrawalAmount: withdrawalAmount ? toNumber(withdrawalAmount) : undefined, // optional
          refundAddress,  // optional
          sendAmount: sendAmount ? toNumber(sendAmount) : undefined, // optional
          userId, // optional
          meta: {
            sendWalletType, // optional
            receiveWalletType, // optional
          },
        }))
          .then((order) => {
            return finish(null, order)
          })
      })
      .catch((e) => {
        log.error('createOrder', e)
        return finish(`Failed to create swap for pair ${sendSymbol}->${receiveSymbol}, please contact support@faa.st. Error: ${e.message}`)
      })
  })
}

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

export const ensureSwapTxCreated = (swap, options) => (dispatch) => Promise.resolve().then(() => {
  if (swap && !swap.txId && swap.sendWalletId) {
    options = {
      ...options,
      extraId: swap.depositAddressExtraId
    }
    return dispatch(createSwapTx(swap, options))
  }
})

export const createSwap = (swapParams, options) => (dispatch, getState) => {
  const swapId = (swapParams.id = swapParams.id || uuid())
  dispatch(swapAdded(swapParams))
  dispatch(swapInitStarted(swapParams.id))
  return dispatch(createOrder(swapParams))
    .then((swap) => {
      if (swap.error) {
        throw new Error(swap.error)
      }
      swap.id = swapId
      options = {
        ...options,
        extraId: swap.depositAddressExtraId
      }
      if (swap.sendWalletId) {
        return dispatch(createSwapTx(swap, options))
      }
      return swap
    })
    .then(() => dispatch(swapInitSuccess(swapId)))
    .then(() => getSwap(getState(), swapId))
    .catch((e) => {
      log.error('Failed to create swap', swapParams, e)
      toastr.error('Failed to create swap, please contact support@faa.st')
      dispatch(swapInitFailed(swapId, e.message || e))
      throw e
    })
}

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
    if (tx.signed) {
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
    if (tx.sent) {
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

import { flatten } from 'lodash'
import { MultiWallet } from 'Services/Wallet'
import { newScopedCreateAction } from 'Utilities/action'
import log from 'Log'
import Faast from 'Services/Faast'
import toastr from 'Utilities/toastrWrapper'
import { signTx, sendTx } from 'Actions/tx'
import { defaultPortfolioId } from 'Actions/portfolio'
import { walletOrdersLoading, walletOrdersLoaded, walletOrdersAllLoaded } from 'Actions/wallet'
import { getTx, getWallet } from 'Selectors'
import { getSwap } from 'Common/selectors/swap'
import { swapAdded, createSwapTx, pollOrderStatus } from 'Common/actions/swap'

export * from 'Common/actions/swap'

const createAction = newScopedCreateAction(__filename)

export const resetSwaps = createAction('RESET_ALL')
export const swapsRetrieved = createAction('RETRIEVED', (orders) => orders, (_, walletId) => ({ walletId }))
export const swapRemoved = createAction('REMOVED', (id) => ({ id }))
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

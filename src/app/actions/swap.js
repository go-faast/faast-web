import { createAction } from 'redux-act'

import { getCurrentWallet } from 'Selectors'
import { removeSwundle } from 'Actions/request'

export const setSwaps = createAction('SET_SWAPS')
export const resetSwaps = createAction('RESET_SWAPS')
export const swapUpdated = createAction('SWAP_UPDATED', (id, data) => ({ id, ...data }))
export const swapOrderUpdated = createAction('SWAP_ORDER_UPDATED', (id, data) => ({ id, order: data }))

export const swapTxUpdated = createAction('SWAP_TX_UPDATED', (id, data) => ({ id, tx: data }))
export const swapTxSigningStart = createAction('SWAP_TX_SIGNING_START', (id) => ({ id }))
export const swapTxSigningSuccess = createAction('SWAP_TX_SIGNING_SUCCESS', (id) => ({ id }))
export const swapTxSigningFailed = createAction('SWAP_TX_SIGNING_FAILED', (id, errorMessage) => ({ id, signingError: errorMessage }))

const clearAllIntervals = () => {
  Object.keys(window.faast.intervals).forEach((key) => {
    window.faast.intervals[key].forEach(a => window.clearInterval(a))
  })
}

export const forgetCurrentOrder = () => (dispatch, getState) => {
  const wallet = getCurrentWallet(getState())
  clearAllIntervals()
  dispatch(resetSwaps())
  dispatch(removeSwundle(wallet && wallet.id))
}
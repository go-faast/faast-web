import { createAction } from 'redux-act'

export const setSwaps = createAction('SET_SWAPS')

export const resetSwaps = createAction('RESET_SWAPS')

export const swapUpdated = createAction('SWAP_UPDATED', (id, data) => ({ id, ...data }))

export const swapTxUpdated = createAction('SWAP_TX_UPDATED', (id, data) => ({ id, tx: data }))

export const swapOrderUpdated = createAction('SWAP_ORDER_UPDATED', (id, data) => ({ id, order: data }))
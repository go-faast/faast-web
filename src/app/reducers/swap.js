import { createReducer } from 'redux-act'
import { omit, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/app'
import {
  resetSwaps, setSwaps, swapUpdated, swapTxUpdated, swapOrderUpdated,
  swapTxSigningStart, swapTxSigningSuccess, swapTxSigningFailed,
  swapTxSendingStart, swapTxSendingSuccess, swapTxSendingFailed,
} from 'Actions/swap'

const initialState = {}
const swapInitialState = {
  sendWalletId: '',
  sendSymbol: '',
  sendUnits: ZERO,
  receiveWalletId: '',
  receiveSymbol: '',
  rate: undefined,
  fee: undefined,
  orderId: '',
  order: {},
  tx: {},
}

const upsertSwap = createUpserter('id', swapInitialState)
const updateSwap = createUpdater('id')
const updateSwapFields = (state, { id, ...nested }) => updateSwap(state, {
  id,
  ...Object.entries(nested).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: isObject(value) ? {
      ...((state[id] || {})[key] || {}),
      ...value
    } : value,
  }), {})
})

const normalize = (swap) => !(swap.order && swap.order.orderId) ? swap : ({
  ...swap,
  orderId: swap.order.orderId,
  order: {
    ...omit(swap.order, 'orderId'),
    id: swap.order.orderId,
  }
})

export default createReducer({
  [resetAll]: () => initialState,
  [resetSwaps]: () => initialState,
  [setSwaps]: (state, swaps) => (isObject(swaps) ? Object.values(swaps) : swaps)
    .map(normalize)
    .reduce(upsertSwap, {}),
  [swapUpdated]: (state, swap) => updateSwap(state, normalize(swap)),
  [swapTxUpdated]: updateSwapFields,
  [swapOrderUpdated]: (state, { id, order }) => updateSwapFields(state, normalize({ id, order })),
  [swapTxSigningStart]: (state, { id }) => updateSwapFields(state, { id, tx: { signing: true } }),
  [swapTxSigningSuccess]: (state, { id, tx }) => updateSwapFields(state, { id, tx: { ...tx, signing: false } }),
  [swapTxSigningFailed]: (state, { id, signingError }) => updateSwapFields(state, { id, tx: { signing: false, signingError } }),
  [swapTxSendingStart]: (state, { id }) => updateSwapFields(state, { id, tx: { sending: true } }),
  [swapTxSendingSuccess]: (state, { id, tx }) => updateSwapFields(state, { id, tx: { ...tx, sending: false } }),
  [swapTxSendingFailed]: (state, { id, sendingError }) => updateSwapFields(state, { id, tx: { sending: false, sendingError } }),
}, initialState)

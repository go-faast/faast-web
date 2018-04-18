import { createReducer } from 'redux-act'
import { isArray, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/redux'
import {
  resetSwaps, setSwaps, swapUpdated, swapTxUpdated, swapOrderUpdated,
  swapTxSigningStart, swapTxSigningSuccess, swapTxSigningFailed
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
  tx: {},
  order: {},
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

export default createReducer({
  [resetAll]: () => initialState,
  [resetSwaps]: () => initialState,
  [setSwaps]: (state, swaps) => isArray(swaps)
    ? swaps.reduce(upsertSwap, {})
    : swaps,
  [swapUpdated]: updateSwap,
  [swapTxUpdated]: updateSwapFields,
  [swapOrderUpdated]: updateSwapFields,
  [swapTxSigningStart]: (state, { id }) => updateSwapFields(state, { id, tx: { signing: true } }),
  [swapTxSigningSuccess]: (state, { id }) => updateSwapFields(state, { id, tx: { signing: false } }),
  [swapTxSigningFailed]: (state, { id, signingError }) => updateSwapFields(state, { id, tx: { signing: false, signingError } }),
}, initialState)
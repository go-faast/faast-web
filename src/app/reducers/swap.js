import { createReducer } from 'redux-act'
import { isArray } from 'lodash'

import { createUpdater } from 'Utilities/helpers'

import { resetAll } from 'Actions/redux'
import {
  resetSwaps, setSwaps, swapUpdated, swapTxUpdated, swapOrderUpdated
} from 'Actions/swap'

const initialState = {}

const updateSwap = createUpdater('id')

export default createReducer({
  [resetAll]: () => initialState,
  [resetSwaps]: () => initialState,
  [setSwaps]: (state, swaps) => ({
    ...state,
    ...(isArray(swaps) ? swaps.reduce((byId, swap) => ({ [swap.id]: swap }), {}) : swaps),
  }),
  [swapUpdated]: updateSwap,
  [swapTxUpdated]: (state, { id, tx }) => updateSwap(state, {
    id,
    tx: {
      ...((state[id] || {}).tx || {}),
      ...tx
    }
  }),
  [swapOrderUpdated]: (state, { id, order }) => updateSwap(state, {
    id,
    order: {
      ...((state[id] || {}).order || {}),
      ...order
    }
  })
}, initialState)
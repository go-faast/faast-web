import { createReducer } from 'redux-act'
import { isArray } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/redux'
import {
  resetSwaps, setSwaps, swapUpdated, swapTxUpdated, swapOrderUpdated
} from 'Actions/swap'

const initialState = {}
const swapInitialState = {
  sendWalletId: '',
  sendSymbol: '',
  sendUnits: ZERO,
  receiveWalletId: '',
  receiveSymbol: '',
  rate: null,
  fee: null,
  tx: null,
  order: null,
}

const upsertSwap = createUpserter('id', swapInitialState)
const updateSwap = createUpdater('id')
const updateSwapFields = (state, { id, ...nested }) => updateSwap(state, {
  id,
  ...Object.entries(nested).reduce((acc, [key, value]) => ({
    ...acc,
    [key]: {
      ...((state[id] || {})[key] || {}),
      ...value
    }
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
}, initialState)
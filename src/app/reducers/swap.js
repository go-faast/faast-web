import { createReducer } from 'redux-act'
import { omit, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/app'
import {
  resetSwaps, setSwaps, swapAdded, swapUpdated, swapRemoved,
  swapTxUpdated, swapOrderUpdated,
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
  pair: '',
  rate: undefined,
  fee: undefined,
  orderId: '',
  order: {},
  tx: {},
  txSigning: false,
  txSigned: false,
  txSigningError: '',
  txSending: false,
  txSent: false,
  txSendingError: '',
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
  [swapAdded]: (state, swap) => upsertSwap(state, normalize(swap)),
  [swapUpdated]: (state, swap) => updateSwap(state, normalize(swap)),
  [swapRemoved]: (state, { id }) => omit(state, id),
  [swapTxUpdated]: updateSwapFields,
  [swapOrderUpdated]: (state, { id, order }) => updateSwapFields(state, normalize({ id, order })),
  [swapTxSigningStart]: (state, { id }) => updateSwapFields(state, { id, txSigning: true, txSigningError: '' }),
  [swapTxSigningSuccess]: (state, { id, tx }) => updateSwapFields(state, { id, tx, txSigning: false, txSigned: true }),
  [swapTxSigningFailed]: (state, { id, signingError }) => updateSwapFields(state, { id, txSigning: false, txSigningError: signingError }),
  [swapTxSendingStart]: (state, { id }) => updateSwapFields(state, { id, txSending: true, txSendingError: '' }),
  [swapTxSendingSuccess]: (state, { id, tx }) => updateSwapFields(state, { id, tx, txSending: false, txSent: true }),
  [swapTxSendingFailed]: (state, { id, sendingError }) => updateSwapFields(state, { id, txSending: false, txSendingError: sendingError }),
}, initialState)

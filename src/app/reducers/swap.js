import { createReducer } from 'redux-act'
import { omit, pick, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/app'
import {
  resetSwaps, setSwaps, swapAdded, swapUpdated, swapRemoved,
  swapOrderUpdated,
} from 'Actions/swap'

const initialState = {}
const swapInitialState = {
  id: '',
  sendWalletId: '',
  sendSymbol: '',
  sendUnits: ZERO,
  receiveWalletId: '',
  receiveSymbol: '',
  rate: undefined,
  fee: undefined,
  orderId: '',
  order: {},
  txId: '',
}

const upsertSwap = createUpserter('id', swapInitialState)
const updateSwap = createUpdater('id')

const normalizeOrder = (order) => order && order.orderId ? ({
  orderId: order.orderId,
  order: {
    ...omit(order, 'orderId'),
    id: order.orderId,
  },
}) : {}

const normalizeTx = (tx) => tx && tx.id ? ({
  txId: tx.id,
}) : {}

const normalize = (swap) => ({
  ...pick(swap, Object.keys(swapInitialState)),
  ...normalizeOrder(swap.order),
  ...normalizeTx(swap.tx),
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
  [swapOrderUpdated]: (state, { id, order }) => updateSwap(state, { id, ...normalizeOrder(order) }),
}, initialState)

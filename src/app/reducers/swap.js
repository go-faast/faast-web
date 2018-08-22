import { createReducer } from 'redux-act'
import { omit, pick } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { ZERO } from 'Utilities/convert'

import { resetAll } from 'Actions/app'
import {
  resetSwaps, swapsRestored, swapAdded, swapUpdated, swapRemoved,
  swapOrderUpdated, swapError, swapOrderStatusUpdated
} from 'Actions/swap'

const initialState = {}
const swapInitialState = {
  v: '2',
  id: '',
  createdAt: new Date(0),
  sendWalletId: '',
  sendSymbol: '',
  sendUnits: ZERO,
  receiveWalletId: '',
  receiveSymbol: '',
  receiveUnits: ZERO,
  depositAddress: '',
  rate: undefined,
  fee: undefined,
  orderId: '',
  orderStatus: '',
  order: {},
  txId: '',
  error: '',
  errorType: '',
}

const upsertSwap = createUpserter('id', swapInitialState)
const updateSwap = createUpdater('id')

const normalizeOrder = (order) => order && order.orderId ? ({
  orderId: order.orderId,
  orderStatus: order.status,
  order: {
    ...omit(order, 'orderId', 'status'),
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
  [swapsRestored]: (state, swaps) => swaps
    .map(normalize)
    .reduce(upsertSwap, {}),
  [swapAdded]: (state, swap) => upsertSwap(state, normalize(swap)),
  [swapUpdated]: (state, swap) => updateSwap(state, normalize(swap)),
  [swapError]: (state, swap) => updateSwap(state, normalize(swap)),
  [swapOrderStatusUpdated]: (state, swap) => updateSwap(state, normalize(swap)),
  [swapRemoved]: (state, { id }) => omit(state, id),
  [swapOrderUpdated]: (state, { id, order }) => updateSwap(state, { id, ...normalizeOrder(order) }),
}, initialState)

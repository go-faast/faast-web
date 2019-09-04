import { createReducer } from 'redux-act'
import { omit, pick } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { BigNumber, ZERO } from 'Utilities/convert'
import { SwapOrder } from 'Types'
import { resetAll } from 'Actions/app'
import {
  resetSwaps, swapsRetrieved, swapAdded, swapUpdated, swapRemoved, swapError,
  swapInitStarted, swapInitSuccess, swapInitFailed, swapOrderStatusUpdated, swapTxIdUpdated,
} from 'Actions/swap'

type SwapState = SwapOrder & {
  id: string,
  sendAmount: BigNumber,
  receiveWalletId: string,
  txId: string,
  error: string,
  errorType: string,
  initializing: boolean,
  initialized: boolean,
}

const initialState = {}
const swapInitialState: SwapState = {
  // Frontend fields
  id: '',
  sendAmount: undefined, // Used to specify swap tx amount with full precision. If undefined use depositAmount
  receiveWalletId: '', // derived from receiveAddress
  txId: '', // txId of deposit transaction
  error: '',
  errorType: '',
  initializing: false,
  initialized: true,
  // Fields from backend
  orderId: '', // backend swap_id
  orderStatus: '',
  createdAt: null,
  updatedAt: null,
  depositAddress: '',
  sendWalletId: '',
  depositAmount: ZERO, // Equivalent to sendAmount but backend loses precision so keep separate
  sendSymbol: '',
  receiveAddress: '',
  receiveAmount: undefined,
  receiveSymbol: '',
  spotRate: undefined,
  rate: undefined,
  rateLockedAt: null,
  rateLockedUntil: null,
  amountDeposited: undefined,
  amountWithdrawn: undefined,
  backendOrderId: undefined,
  backendOrderState: undefined,
  receiveTxId: undefined,
  refundAddress: undefined,
  depositAddressExtraId: undefined,
}

const upsert = createUpserter('id', swapInitialState)
const update = createUpdater('id')

const normalizeTx = (tx?: { id?: string }) => tx && tx.id ? ({
  txId: tx.id,
}) : {}

const normalize = (swap: { id?: string, orderId?: string, tx?: object }) => ({
  id: swap.id || swap.orderId,
  ...pick(swap, Object.keys(swapInitialState)),
  ...normalizeTx(swap.tx),
})

export default createReducer({
  [resetAll]: () => initialState,
  [resetSwaps]: () => initialState,
  [swapsRetrieved]: (state, swaps) => swaps
    .map(normalize)
    .reduce(upsert, state),
  [swapAdded]: (state, swap) => upsert(state, normalize(swap)),
  [swapUpdated]: (state, swap) => update(state, normalize(swap)),
  [swapError]: (state, swap) => update(state, normalize(swap)),
  [swapRemoved]: (state, { id }) => omit(state, id),
  [swapOrderStatusUpdated]: update,
  [swapTxIdUpdated]: update,
  [swapInitStarted]: (state, { id }) => update(state, {
    id,
    initializing: true,
    initialized: false,
    error: swapInitialState.error,
  }),
  [swapInitSuccess]: (state, { id }) => update(state, { id, initializing: false, initialized: true }),
  [swapInitFailed]: (state, { id, error }) => update(state, { id, initializing: false, error, errorType: 'init' }),
}, initialState)

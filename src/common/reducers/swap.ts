import { createReducer } from 'redux-act'
import { omit, pick } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { BigNumber, ZERO } from 'Utilities/convert'
import { SwapOrder } from 'Types'
import {
  swapAdded, swapUpdated, swapError, restoreSwaps,
  swapInitStarted, swapInitSuccess, swapInitFailed,
} from 'Common/actions/swap'

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

export const commonSwapInitialState: SwapState = {
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
  withdrawalAddressExtraId: undefined,
  refundAddressExtraId: undefined,
  marketMakerName: undefined,
}

const upsert = createUpserter('id', commonSwapInitialState)
const update = createUpdater('id')

const normalizeTx = (tx?: { id?: string }) => tx && tx.id ? ({
  txId: tx.id,
}) : {}

const normalize = (swap: { id?: string, orderId?: string, tx?: object }) => ({
  id: swap.id || swap.orderId,
  ...pick(swap, Object.keys(commonSwapInitialState)),
  ...normalizeTx(swap.tx),
})

export const commonReducerFunctions = {
  // @ts-ignore
  [swapAdded]: (state, swap) => upsert(state, normalize(swap)),
  // @ts-ignore
  [swapUpdated]: (state, swap) => update(state, normalize(swap)),
  // @ts-ignore
  [restoreSwaps]: (state, swaps) => ({
    ...state,
    ...swaps,
  }),
  // @ts-ignore
  [swapError]: (state, swap) => update(state, normalize(swap)),
  // @ts-ignore
  [swapInitStarted]: (state, { id }) => update(state, {
    id,
    initializing: true,
    initialized: false,
    error: commonSwapInitialState.error,
  }),
  // @ts-ignore
  [swapInitSuccess]: (state, { id }) => update(state, { id, initializing: false, initialized: true }),
  // @ts-ignore
  [swapInitFailed]: (state, { id, error }) => update(state, { id, initializing: false, error, errorType: 'init' }),
}

export default createReducer(commonReducerFunctions, initialState)

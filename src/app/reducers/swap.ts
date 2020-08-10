// @ts-nocheck
import { createReducer } from 'redux-act'
import { omit, pick } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { commonSwapInitialState, commonReducerFunctions } from 'Common/reducers/swap'
import {
  resetSwaps, swapsRetrieved, swapRemoved, swapTxIdUpdated,
} from 'Actions/swap'

import { resetAll } from 'Actions/app'

const initialState = {}

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

export default createReducer({
  ...commonReducerFunctions,
  [resetAll]: () => initialState,
  [resetSwaps]: () => initialState,
  [swapsRetrieved]: (state, swaps) => swaps
    .map(normalize)
    .reduce(upsert, state),
  [swapRemoved]: (state, { id }) => omit(state, id),
  [swapTxIdUpdated]: update,
}, initialState)

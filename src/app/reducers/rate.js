import { createReducer } from 'redux-act'

import {
  rateLoading,
  rateUpdated,
  rateError
} from 'Actions/rate'
import { createUpserter, createUpdater } from 'Utilities/helpers'

const initialState = {
}

const rateInitialState = {
  pair: '',
  price: null,
  deposit_amount: null,
  minimum_deposit: null,
  maximum_deposit: null,
  error: '',
  lastUpdated: undefined,
  loading: false
}

const normalizeKey = (pair) => pair.toLowerCase()
const upsert = createUpserter('pair', rateInitialState, normalizeKey)
const update = createUpdater('pair', normalizeKey)

export default createReducer({
  [rateLoading]: (state, { pair }) => upsert(state, {
    pair,
    loading: true,
    lastUpdated: Date.now()
  }),
  [rateUpdated]: (state, data) => update(state, {
    ...data,
    loading: false,
    lastUpdated: Date.now(),
  }),
  [rateError]: (state, { pair, error }) => update(state, { pair, error }),
}, initialState)

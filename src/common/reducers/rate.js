import { createReducer } from 'redux-act'

import {
  rateLoading,
  rateUpdated,
  rateError
} from 'Actions/rate'
import { createUpserter, createUpdater } from 'Utilities/helpers'

export const initialState = {
}

export const rateInitialState = {
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

export const reducerFunctions = {
  [rateLoading]: (state, { pair }) => upsert(state, {
    pair,
    loading: true,
    lastUpdated: Date.now(),
    error: ''
  }),
  [rateUpdated]: (state, data) => update(state, {
    ...data,
    loading: false,
    lastUpdated: Date.now(),
    error: ''
  }),
  [rateError]: (state, { pair, error }) => update(state, { pair, error }),
}

export default createReducer(reducerFunctions, initialState)
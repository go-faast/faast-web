import { createReducer } from 'redux-act'
import {
  rateLoading,
  rateUpdated,
  rateError,
  updateSymbol
} from 'Actions/currency'
import { createUpserter, createUpdater } from 'Utilities/helpers'

export const initialState = {
  selectedSymbol: 'USD',
  data: {}
}

export const rateInitialState = {
  symbol: '',
  rate: null,
  error: '',
  lastUpdated: undefined,
  loading: false
}

const upsert = createUpserter('symbol', rateInitialState)
const update = createUpdater('symbol')

export const reducerFunctions = {
  [updateSymbol]: (state, symbol) => ({ ...state, symbol }),
  [rateLoading]: (state, { symbol }) => ({
    ...state,
    data: upsert(state.data, {
      symbol,
      loading: true,
      lastUpdated: Date.now(),
      error: ''
    })
  }),
  [rateUpdated]: (state, data) => ({
    ...state,
    data: update(state.data, {
      ...data,
      loading: false,
      lastUpdated: Date.now(),
      error: ''
    })
  }),
  [rateError]: (state, { symbol, error }) => ({
    ...state,
    data: update(state.data, { symbol, error })
  }),
}

export default createReducer(reducerFunctions, initialState)
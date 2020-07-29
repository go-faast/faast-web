import { createReducer } from 'redux-act'
import {
  rateLoading,
  rateUpdated,
  rateError,
  updateSymbol,
  updatePreviousCurrency
} from 'Actions/currency'
import { createUpserter, createUpdater } from 'Utilities/helpers'

export const initialState = {
  selectedLabel: 'USD',
  selectedSymbol: '$',
  previousCurrency: 'USD',
  data: {}
}

export const rateInitialState = {
  label: '',
  rate: null,
  error: '',
  lastUpdated: undefined,
  loading: false
}

const upsert = createUpserter('label', rateInitialState)
const update = createUpdater('label')

export const reducerFunctions = {
  [updateSymbol]: (state, { label, symbol }) => ({ 
    ...state,
    selectedLabel: label,
    selectedSymbol: symbol,
  }),
  [updatePreviousCurrency]: (state, previousCurrency) => ({ 
    ...state,
    previousCurrency,
  }),
  [rateLoading]: (state, { label }) => ({
    ...state,
    data: upsert(state.data, {
      label,
      loading: true,
      lastUpdated: Date.now(),
      error: ''
    })
  }),
  [rateUpdated]: (state, { label, rate }) => ({
    ...state,
    data: update(state.data, {
      label,
      rate,
      loading: false,
      lastUpdated: Date.now(),
      error: ''
    })
  }),
  [rateError]: (state, { label, error }) => ({
    ...state,
    data: update(state.data, { label, error })
  }),
}

export default createReducer(reducerFunctions, initialState)
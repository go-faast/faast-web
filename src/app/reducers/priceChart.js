import { createReducer } from 'redux-act'
import {
  priceChartLoading,
  priceChartUpdated,
  priceChartError
} from 'Actions/priceChart'
import { createUpserter } from 'Utilities/helpers'

const initialState = {
}

const priceChartInitialState = {
  symbol: '',
  data: [],
  lastUpdated: null,
  loading: false,
  error: ''
}

const upsertAsset = createUpserter('symbol', priceChartInitialState)

export default createReducer({
  [priceChartLoading]: (state, symbol) => upsertAsset(state, { symbol, loading: true }),
  [priceChartUpdated]: (state, { symbol, data }) => upsertAsset(state, { symbol, data, loading: false, lastUpdated: Date.now()  }),
  [priceChartError]: (state, { symbol, error }) => upsertAsset(state, { symbol, error }),
}, initialState)

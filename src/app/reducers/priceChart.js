import { createReducer } from 'redux-act'
import {
  priceChartDataLoading,
  priceChartDataUpdated,
  priceChartDataError
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
  [priceChartDataLoading]: (state, symbol) => upsertAsset(state, { symbol, loading: true }),
  [priceChartDataUpdated]: (state, { symbol, data }) => upsertAsset(state, { symbol, data, loading: false, lastUpdated: Date.now()  }),
  [priceChartDataError]: (state, { symbol, error }) => upsertAsset(state, { symbol, error }),
}, initialState)

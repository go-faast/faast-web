import { createReducer } from 'redux-act'
import {
  priceChartDataLoading,
  priceChartDataUpdated,
  priceChartDataError
} from 'Actions/priceChart'
import { createUpserter } from 'Utilities/helpers'

const initialState = {
}

const chartDataInitialState = {
  symbol: '',
  priceData: [],
  lastUpdatedPrice: null,
  loadingChartData: false,
  chartDataError: ''
}

const upsertAsset = createUpserter('symbol', chartDataInitialState)

export default createReducer({
  [priceChartDataLoading]: (state, symbol) => upsertAsset(state, { symbol, loadingChartData: true }),
  [priceChartDataUpdated]: (state, { symbol, priceData }) => upsertAsset(state, { symbol, priceData, loadingChartData: false, lastUpdatedPrice: Date.now()  }),
  [priceChartDataError]: (state, { symbol, message }) => upsertAsset(state, { symbol, chartDataError: message }),
}, initialState)

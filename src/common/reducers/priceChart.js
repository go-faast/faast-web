import { createReducer } from 'redux-act'
import {
  priceChartLoading,
  priceChartUpdated,
  priceChartError
} from 'Common/actions/priceChart'
import { createUpserter } from 'Utilities/helpers'

const initialState = {
}

const priceChartInitialState = {
  symbol: '',
  priceData: [],
  marketCapData: [],
  volumeData: [],
  lastUpdated: null,
  loading: false,
  error: ''
}

const upsertAsset = createUpserter('cmcIDno', priceChartInitialState)

export default createReducer({
  [priceChartLoading]: (state, cmcIDno) => upsertAsset(state, { cmcIDno, loading: true }),
  [priceChartUpdated]: (state, { cmcIDno, data }) => upsertAsset(state, { 
    cmcIDno, 
    priceData: data.price_usd, 
    marketCapData: data.market_cap_usd,
    volumeData: data.volume_24h_usd,
    loading: false, 
    lastUpdated: Date.now() 
  }),
  [priceChartError]: (state, { cmcIDno, error }) => upsertAsset(state, { cmcIDno, error }),
}, initialState)

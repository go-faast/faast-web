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
  data: [],
  lastUpdated: null,
  loading: false,
  error: ''
}

const upsertAsset = createUpserter('cmcIDno', priceChartInitialState)

export default createReducer({
  [priceChartLoading]: (state, cmcIDno) => upsertAsset(state, { cmcIDno, loading: true }),
  [priceChartUpdated]: (state, { cmcIDno, data }) => upsertAsset(state, { cmcIDno, data, loading: false, lastUpdated: Date.now() }),
  [priceChartError]: (state, { cmcIDno, error }) => upsertAsset(state, { cmcIDno, error }),
}, initialState)

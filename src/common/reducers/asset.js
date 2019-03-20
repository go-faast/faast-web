import { createReducer } from 'redux-act'
import { pick } from 'lodash'
import {
  assetsRestored,
  assetsLoading, assetsLoaded, assetsLoadingError,
  assetPriceLoading, assetPriceUpdated, assetPriceError,
  assetPricesLoading, assetPricesUpdated, assetPricesError,
} from 'Common/actions/asset'
import { watchlistUpdated } from 'Actions/asset'
import { toBigNumber, ZERO } from 'Utilities/convert'
import { createUpserter, createUpdater, mapValues } from 'Utilities/helpers'

export const initialState = {
  loading: false,
  loaded: false,
  loadingError: '',
  pricesLoading: false,
  pricesLoaded: false,
  pricesError: '',
  data: {},
}
export const assetInitialState = {
  symbol: '',
  name: '',
  walletUrl: '',
  infoUrl: '',
  iconUrl: '',
  decimals: 0,
  deposit: false,
  receive: false,
  change24: ZERO,
  price: ZERO,
  change1: ZERO,
  change7d: ZERO,
  volume24: ZERO,
  marketCap: ZERO,
  availableSupply: ZERO,
  lastUpdatedPrice: null,
  priceLoading: false,
  priceLoaded: false,
  priceError: '',
  onWatchlist: false,
  restricted: false,
}

const priceDataToAsset = (priceData) => {
  const change24 = priceData.percentChange24h || 0
  return {
    symbol: priceData.symbol,
    change24,
    change24decrease: toBigNumber(change24).isNegative(),
    price: priceData.price || 0,
    change1: priceData.percentChange1h || 0,
    change7d: priceData.percentChange7d || 0,
    volume24: priceData.volume24h || 0,
    marketCap: priceData.marketCap || 0,
    availableSupply: priceData.availableSupply || 0,
    lastUpdatedPrice: priceData.last_updated || 0,
    priceLoading: false,
    priceLoaded: true,
    priceError: assetInitialState.priceError
  }
}

const upsertAsset = createUpserter('symbol', assetInitialState)
const updateAsset = createUpdater('symbol')

export const reducerFunctions = {
  [assetsRestored]: (state, restoredState) => ({
    ...restoredState,
    loading: false,
    pricesLoading: false,
    data: mapValues(restoredState.data, (asset) => ({
      ...asset,
      priceLoading: false,
    })),
  }),
  [assetsLoading]: (state) => ({
    ...state,
    loading: true,
  }),
  [assetsLoaded]: (state, assetArray) => ({
    ...state,
    data: assetArray.reduce((allAssets, asset) => upsertAsset(allAssets, {
      ...asset,
      swapEnabled: asset.deposit && asset.receive
    }), pick(state.data, assetArray.map(({ symbol }) => symbol))), // Removes any old assets not included in new assetArray
    loading: false,
    loaded: true,
    loadingError: initialState.loadingError,
  }),
  [assetsLoadingError]: (state, loadingError) => ({ ...state, loading: false, loadingError }),
  [assetPriceLoading]: (state, { symbol }) => ({
    ...state,
    data: updateAsset(state.data, { symbol, priceLoading: true })
  }),
  [assetPriceUpdated]: (state, priceData) => ({
    ...state,
    data: updateAsset(state.data, priceDataToAsset(priceData)),
  }),
  [assetPriceError]: (state, { symbol, priceError }) => ({
    ...state,
    data: updateAsset(state.data, { symbol, priceLoading: false, priceError }),
  }),
  [watchlistUpdated]: (state, { symbol, onWatchlist }) => ({
    ...state,
    data: updateAsset(state.data, { symbol, onWatchlist }),
  }),
  [assetPricesLoading]: (state) => ({
    ...state,
    pricesLoading: true,
  }),
  [assetPricesUpdated]: (state, priceDataArray) => ({
    ...state,
    data: priceDataArray.reduce((allAssets, priceData) => updateAsset(allAssets, priceDataToAsset(priceData)), state.data),
    pricesLoading: false,
    pricesLoaded: true,
    pricesError: initialState.pricesError,
  }),
  [assetPricesError]: (state, pricesError) => ({ ...state, pricesLoading: false, pricesError })
}

export default createReducer(reducerFunctions, initialState)

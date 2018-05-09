import { createReducer } from 'redux-act'
import {
  assetsAdded, assetsLoadingError,
  assetPriceUpdated, assetPricesUpdated,
  assetPriceError, assetPricesError,
} from 'Actions/asset'
import { toBigNumber, ZERO } from 'Utilities/convert'
import { createUpserter, createUpdater } from 'Utilities/helpers'

const initialState = {
  loaded: false,
  loadingError: '',
  pricesLoaded: false,
  pricesError: '',
  data: {},
}
const assetInitialState = {
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
  priceError: '',
}

const priceDataToAsset = (priceData) => {
  const change24 = toBigNumber(priceData.percent_change_24h || 0)
  return {
    symbol: priceData.symbol,
    change24,
    change24decrease: change24.isNegative(),
    price: toBigNumber(priceData.price_usd || 0),
    change1: toBigNumber(priceData.percent_change_1h || 0),
    change7d: toBigNumber(priceData.percent_change_7d || 0),
    volume24: toBigNumber(priceData['24h_volume_usd'] || 0),
    marketCap: toBigNumber(priceData.market_cap_usd || 0),
    availableSupply: toBigNumber(priceData.available_supply || 0),
    lastUpdatedPrice: new Date(Number.parseInt(priceData.last_updated || '0') * 1000),
  }
}

const upsertAsset = createUpserter('symbol', assetInitialState)
const updateAsset = createUpdater('symbol')

export default createReducer({
  [assetsAdded]: (state, assetArray) => ({
    ...state,
    data: assetArray.reduce((allAssets, asset) => upsertAsset(allAssets, {
      ...asset,
      swapEnabled: asset.deposit && asset.receive
    }), state.data),
    loaded: true,
    loadingError: initialState.loadingError,
  }),
  [assetsLoadingError]: (state, loadingError) => ({ ...state, loadingError }),
  [assetPriceUpdated]: (state, priceData) => ({
    ...state,
    data: updateAsset(state.data, {
      ...priceDataToAsset(priceData),
      priceError: assetInitialState.priceError,
    }),
  }),
  [assetPriceError]: (state, { symbol, priceError }) => ({
    ...state,
    data: updateAsset(state.data, { symbol, priceError }),
  }),
  [assetPricesUpdated]: (state, priceDataArray) => ({
    ...state,
    data: priceDataArray.reduce((allAssets, priceData) => updateAsset(allAssets, priceDataToAsset(priceData)), state.data),
    pricesLoaded: true,
    pricesError: initialState.pricesError,
  }),
  [assetPricesError]: (state, pricesError) => ({ ...state, pricesError })
}, initialState)

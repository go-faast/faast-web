import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'
import { isAssetPriceLoading, areAssetsLoading, areAssetPricesLoading } from 'Common/selectors/asset'

const createAction = newScopedCreateAction(__filename)

export const assetsRestored = createAction('RESTORE_ALL')

export const assetsLoading = createAction('ASSETS_LOADING')
export const assetsLoaded = createAction('ASSETS_LOADED')
export const assetsLoadingError = createAction('ASSETS_ERROR')

export const assetPriceLoading = createAction('PRICE_LOADING', (symbol) => ({ symbol }))
export const assetPriceUpdated = createAction('PRICE_UPDATED', (asset) => asset)
export const assetPriceError = createAction('PRICE_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const assetPricesLoading = createAction('PRICES_LOADING')
export const assetPricesUpdated = createAction('PRICES_UPDATED')
export const assetPricesError = createAction('PRICES_ERROR')

export const restoreAssets = (assetState) => (dispatch) => {
  dispatch(assetsRestored(assetState))
}

export const retrieveAssets = () => (dispatch, getState) => {
  if (areAssetsLoading(getState())) {
    return
  }
  dispatch(assetsLoading())
  return Faast.fetchAssets()
    .then((assets) => dispatch(assetsLoaded(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset list'
      dispatch(assetsLoadingError(message))
      throw new Error(message)
    })
}

export const retrieveAssetPrice = (symbol) => (dispatch, getState) => {
  if (isAssetPriceLoading(getState(), symbol)) {
    return
  }
  dispatch(assetPriceLoading(symbol))
  return Faast.fetchAssetPrice(symbol)
    .then((asset) => dispatch(assetPriceUpdated(asset)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(assetPriceError(symbol, message))
      throw new Error(message)
    })
}

export const retrieveAssetPrices = () => (dispatch, getState) => {
  if (areAssetPricesLoading(getState())) {
    return
  }
  dispatch(assetPricesLoading())
  return Faast.fetchAssetPrices()
    .then((assets) => dispatch(assetPricesUpdated(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset prices'
      dispatch(assetPricesError(message))
      throw new Error(message)
    })
}

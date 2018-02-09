import { createAction } from 'redux-act'
import { fetchGet } from 'Utilities/fetch'
import log from 'Utilities/log'
import config from 'Config'

export const assetsAdded = createAction('ASSETS_UPDATED')
export const assetsLoadingError = createAction('ASSETS_LOADING_ERROR')

export const assetPriceUpdated = createAction('ASSET_PRICE_UPDATED')
export const assetPriceError = createAction('ASSET_PRICE_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const assetPricesUpdated = createAction('ASSET_PRICES_UPDATED')
export const assetPricesError = createAction('ASSET_PRICES_ERROR')

export const retrieveAssets = () => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/assets`)
    .then((assets) => assets.filter((asset) => {
      if (!asset.symbol) {
        log.warn('omitting asset without symbol', asset)
        return false
      }
      if (!asset.name) {
        log.warn('omitting asset without name', asset.symbol)
        return false
      }
      return true
    }))
    .then((assets) => dispatch(assetsAdded(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset list'
      dispatch(assetsLoadingError(message))
      throw new Error(message)
    })
}

export const retrieveAssetPrice = (symbol) => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/portfolio-price/${symbol}`)
    .then((asset) => dispatch(assetPriceUpdated(asset)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(assetPriceError(symbol, message))
      throw new Error(message)
    })
}

export const retrieveAssetPrices = () => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/portfolio-price`)
    .then((assets) => dispatch(assetPricesUpdated(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset prices'
      dispatch(assetPricesError(message))
      throw new Error(message)
    })
}
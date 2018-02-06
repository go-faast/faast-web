import { createAction } from 'redux-act'
import { fetchGet } from 'Utilities/fetch'
import log from 'Utilities/log'
import config from 'Config'

export const assetsAdded = createAction('ASSETS_UPDATED')
export const assetPriceUpdated = createAction('ASSET_PRICE_UPDATED')
export const assetPricesUpdated = createAction('ASSET_PRICES_UPDATED')

export const assetPriceError = createAction('ASSET_PRICE_ERROR', (symbol, e) => ({
  symbol,
  priceError: e.message || e,
}))

export const assetPricesError = createAction('ASSET_PRICES_ERROR', (e) => e.message || e)

export const retrieveAssets = () => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/assets`)
    .then((assets) => dispatch(assetsAdded(assets)))
    .catch((err) => {
      log.error(err)
      throw err
    })
}

export const retrieveAssetPrice = (symbol) => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/portfolio-price/${symbol}`)
    .then((asset) => dispatch(assetPriceUpdated(asset)))
    .catch((e) => {
      log.error(e)
      return dispatch(assetPriceError(symbol, e))
    })
}

export const retrieveAssetPrices = () => (dispatch) => {
  return fetchGet(`${config.siteUrl}/app/portfolio-price`)
    .then((assets) => dispatch(assetPricesUpdated(assets)))
    .catch((e) => {
      log.error(e)
      return dispatch(assetPricesError(e))
    })
}
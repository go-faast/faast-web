import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const assetsAdded = createAction('ADDED')
export const assetsLoadingError = createAction('LOADING_ERROR')

export const assetPriceUpdated = createAction('PRICE_UPDATED')
export const assetPriceError = createAction('PRICE_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const assetPricesUpdated = createAction('PRICES_UPDATED')
export const assetPricesError = createAction('PRICES_ERROR')

export const retrieveAssets = () => (dispatch) =>
  Faast.getAssets()
    .then((assets) => dispatch(assetsAdded(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset list'
      dispatch(assetsLoadingError(message))
      throw new Error(message)
    })

export const retrieveAssetPrice = (symbol) => (dispatch) =>
  Faast.getAssetPrice(symbol)
    .then((asset) => dispatch(assetPriceUpdated(asset)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(assetPriceError(symbol, message))
      throw new Error(message)
    })

export const retrieveAssetPrices = () => (dispatch) =>
  Faast.getAssetPrices()
    .then((assets) => dispatch(assetPricesUpdated(assets)))
    .catch((e) => {
      log.error(e)
      const message = 'Failed to load asset prices'
      dispatch(assetPricesError(message))
      throw new Error(message)
    })

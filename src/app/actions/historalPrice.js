import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

import { isHistoricalPriceLoading, isHistoricalAssetPriceStale } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const historicalPriceRestored = createAction('RESTORE_ALL')

export const historicalPriceLoading = createAction('HISTORICAL_PRICE_LOADING', (symbol) => ({ symbol }))
export const historicalPriceUpdated = createAction('HISTORICAL_PRICE_UPDATED', (asset) => asset)
export const historicalPriceError = createAction('HISTORICAL_PRICE_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const restoreHistoricalPrice = (assetState) => (dispatch) => {
  dispatch(historicalPriceRestored(assetState))
}

export const retrieveHistoricalPrice = (symbol) => (dispatch, getState) => {
  if (isHistoricalPriceLoading(getState(), symbol) || !isHistoricalAssetPriceStale(getState(), symbol)) {
    return
  }
  dispatch(historicalPriceLoading(symbol))
  return Faast.fetchPriceChart(symbol)
    .then((asset) => dispatch(historicalPriceUpdated(asset)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(historicalPriceError(symbol, message))
      throw new Error(message)
    })
}

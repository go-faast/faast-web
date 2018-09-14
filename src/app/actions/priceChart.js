import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

import { isPriceChartLoading, isPriceChartStale } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const priceChartLoading = createAction('PRICE_CHART_DATA_LOADING', (symbol) => (symbol))
export const priceChartUpdated = createAction('PRICE_CHART_DATA_UPDATED', (symbol, data) => ({ symbol, data }))
export const priceChartError = createAction('PRICE_CHART_DATA_ERROR', (symbol, error) => ({ symbol, error }))

export const fetchPriceChartData = (symbol) => (dispatch, getState) => {
  if (isPriceChartLoading(getState(), symbol) || !isPriceChartStale(getState(), symbol)) {
    return
  }
  dispatch(priceChartLoading(symbol))
  Faast.fetchPriceChart(symbol)
    .then((priceData) => dispatch(priceChartUpdated(symbol, priceData)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(priceChartError(symbol, message))
      throw new Error(message)
    })
}

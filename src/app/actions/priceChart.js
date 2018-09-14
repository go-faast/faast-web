import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

import { isPriceChartLoading, isPriceChartStale, getPriceChartData } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const priceChartDataLoading = createAction('PRICE_CHART_DATA_LOADING', (symbol) => (symbol))
export const priceChartDataUpdated = createAction('PRICE_CHART_DATA_UPDATED', (symbol, priceData) => ({ symbol, priceData }))
export const priceChartDataError = createAction('PRICE_CHART_DATA_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const fetchPriceChartData = (symbol) => (dispatch, getState) => {
  if (isPriceChartLoading(getState(), symbol) || !isPriceChartStale(getState(), symbol)) {
    return getPriceChartData(getState(), symbol)
  }
  dispatch(priceChartDataLoading(symbol))
  Faast.fetchPriceChart(symbol)
    .then((priceData) => dispatch(priceChartDataUpdated(symbol, priceData)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(priceChartDataError(symbol, message))
      throw new Error(message)
    })
}

import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

import { isPriceChartLoading, isPriceChartStale, getPriceChartData } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const priceChartDataLoading = createAction('PRICE_CHART_DATA_LOADING', (symbol) => (symbol))
export const priceChartDataUpdated = createAction('PRICE_CHART_DATA_UPDATED', (symbol, priceData) => ({ symbol, priceData }))
export const priceChartDataError = createAction('PRICE_CHART_DATA_ERROR', (symbol, priceError) => ({ symbol, priceError }))

export const fetchPriceChartData = (symbol) => (dispatch, getState) => {
  console.log('IN FETCH PRICE ACTION')
  console.log('is loading', isPriceChartLoading(getState(), symbol))
  console.log('is stale', isPriceChartStale(getState(), symbol))
  if (isPriceChartLoading(getState(), symbol) || !isPriceChartStale(getState(), symbol)) {
    console.log('IN SHOULD NOT CALL AGAIN CAUSE NOT STALE OR LOADING')
    return getPriceChartData(getState(), symbol)
  }
  dispatch(priceChartDataLoading(symbol))
  console.log('IN FETCH PRICES BECAUSE STALE OR DONT HAVE')
  Faast.fetchPriceChart(symbol)
    .then((priceData) => dispatch(priceChartDataUpdated(symbol, priceData)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${symbol} price`
      dispatch(priceChartDataError(symbol, message))
      throw new Error(message)
    })
}

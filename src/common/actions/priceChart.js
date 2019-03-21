import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

import { isPriceChartLoading, isPriceChartStale } from 'Common/selectors/priceChart'

const createAction = newScopedCreateAction(__filename)

export const priceChartLoading = createAction('PRICE_CHART_DATA_LOADING', (cmcIDno) => (cmcIDno))
export const priceChartUpdated = createAction('PRICE_CHART_DATA_UPDATED', (cmcIDno, data) => ({ cmcIDno, data }))
export const priceChartError = createAction('PRICE_CHART_DATA_ERROR', (cmcIDno, error) => ({ cmcIDno, error }))

export const fetchPriceChartData = (cmcIDno) => (dispatch, getState) => {
  if (isPriceChartLoading(getState(), cmcIDno) || !isPriceChartStale(getState(), cmcIDno)) {
    return
  }
  dispatch(priceChartLoading(cmcIDno))
  Faast.fetchPriceChart(cmcIDno)
    .then((priceData) => dispatch(priceChartUpdated(cmcIDno, priceData.data)))
    .catch((e) => {
      log.error(e)
      const message = `Failed to load ${cmcIDno} price`
      dispatch(priceChartError(cmcIDno, message))
      throw new Error(message)
    })
}

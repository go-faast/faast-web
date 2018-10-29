import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'

export const getPriceChartState = ({ priceChart }) => priceChart

export const getAllPriceCharts = createSelector(getPriceChartState, (priceCharts) => {
  return {
    ...priceCharts
  }
})

export const getPriceChart = createItemSelector(getAllPriceCharts, selectItemId, (allCharts, symbol) => allCharts[symbol])
export const getPriceChartData = createItemSelector(getPriceChart, fieldSelector('data'))
export const isPriceChartLoading = createItemSelector(getPriceChart, fieldSelector('loading'))
export const isPriceChartStale = createItemSelector(getPriceChart, priceChart => {
  if (priceChart) {
    const { lastUpdated } = priceChart
    const isStale = (Date.now() - lastUpdated) >= 300000
    return isStale
  } else {
    return true
  }
})

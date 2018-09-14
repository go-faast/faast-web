import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'

export const getPriceChartState = ({ priceChart }) => priceChart

export const getAllPriceCharts = createSelector(getPriceChartState, (priceCharts) => {
  return {
    ...priceCharts
  }
})

export const getPriceChartData = createItemSelector(getAllPriceCharts, selectItemId, (allCharts, symbol) => allCharts[symbol])
export const isPriceChartLoading = createItemSelector(getPriceChartData, fieldSelector('loadingChartData'))
export const isPriceChartStale = createItemSelector(getPriceChartData, priceChart => {
  if (priceChart) {
    const { lastUpdatedPrice } = priceChart
    const isStale = (Date.now() - lastUpdatedPrice) >= 300000 ? true : false
    return isStale
  } else {
    return true
  }
})

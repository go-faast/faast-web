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
    const { lastUpdatedPrice } = priceChart
    const isStale = (Date.now() - lastUpdatedPrice) >= 300000 ? true : false
    return isStale
  } else {
    return true
  }
})

import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'

export const getRateState = ({ rate }) => rate

export const getAllRates = createSelector(getRateState, (rates) => {
  return {
    ...rates
  }
})

export const getRate = createItemSelector(getAllRates, selectItemId, (allCharts, symbol) => allCharts[symbol])
export const getRatePrice = createItemSelector(getRate, fieldSelector('price'))
export const getRateMinimumDeposit = createItemSelector(getRate, fieldSelector('minimum_deposit'))
export const isRateLoading = createItemSelector(getRate, fieldSelector('loading'))
export const isRateStale = createItemSelector(getRate, rate => {
  if (rate) {
    const { lastUpdated } = rate
    const isStale = (Date.now() - lastUpdated) >= 900000
    return isStale
  } else {
    return true
  }
})

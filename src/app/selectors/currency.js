import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'
import { mapValues } from 'Utilities/helpers'

export const getRateState = ({ currency }) => currency

export const getAllRates = createSelector(getRateState, ({ data }) => mapValues(data, (rate) => rate))
export const getSelectedSymbol = createSelector(getRateState, (rates) => rates.selectedSymbol)
export const getRate = createItemSelector(
  getAllRates,
  selectItemId,
  (allRates, symbol) => allRates[symbol])
export const getRatePrice = createItemSelector(getRate, fieldSelector('rate'))
export const getRateLastUpdated = createItemSelector(getRate, fieldSelector('lastUpdated'))
export const rateError = createItemSelector(getRate, fieldSelector('error'))
export const isRateLoaded = createItemSelector(getRateLastUpdated, (lastUpdated) => Boolean(lastUpdated))
export const isRateLoading = createItemSelector(getRate, fieldSelector('loading'))
export const isRateStale = createItemSelector(getRate, rate => {
  if (rate) {
    const { lastUpdated } = rate
    const isStale = (Date.now() - lastUpdated) >= 300000
    return isStale
  } else {
    return true
  }
})

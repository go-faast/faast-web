import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'
import { mapValues } from 'Utilities/helpers'

export const getRateState = ({ currency }) => currency

export const getAllRates = createSelector(getRateState, (rates) => mapValues(rates ? rates.data : {}, (rate) => rate))
export const getSelectedLabel = createSelector(getRateState, (rates) => rates && rates.selectedLabel)
export const getSelectedSymbol = createSelector(getRateState, (rates) => rates && rates.selectedSymbol)
export const getPreviousCurrency = createSelector(getRateState, (rates) => rates && rates.previousCurrency)
export const getRate = createItemSelector(
  getAllRates,
  selectItemId,
  (allRates, label) => allRates[label])
export const getSelectedCurrency = createSelector(
  getAllRates,
  getSelectedLabel,
  (allRates, label) => allRates[label])
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

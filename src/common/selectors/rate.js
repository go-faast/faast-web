import { createSelector } from 'reselect'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'

export const getRateState = ({ rate }) => rate

export const getAllRates = createSelector(getRateState, (rates) => rates)

export const getRate = createItemSelector(
  getAllRates,
  selectItemId,
  (allRates, pair) => typeof pair === 'string'
    ? allRates[pair.toLowerCase()]
    : null)
export const getRatePrice = createItemSelector(getRate, fieldSelector('price'))
export const getRateMinimumDeposit = createItemSelector(getRate, fieldSelector('minimum_deposit'))
export const getRateMinimumWithdrawal = createItemSelector(getRate, fieldSelector('minimum_withdrawal'))
export const getRateWithdrawalFee = createItemSelector(getRate, fieldSelector('withdrawal_fee'))
export const getRateMaximumDeposit = createItemSelector(getRate, fieldSelector('maximum_deposit'))
export const getRateMaximumWithdrawal = createItemSelector(getRate, fieldSelector('maximum_withdrawal'))
export const getRateLastUpdated = createItemSelector(getRate, fieldSelector('lastUpdated'))
export const rateError = createItemSelector(getRate, fieldSelector('error'))
export const isRateLoaded = createItemSelector(getRateLastUpdated, (lastUpdated) => Boolean(lastUpdated))
export const isRateLoading = createItemSelector(getRate, fieldSelector('loading'))
export const isRateStale = createItemSelector(getRate, rate => {
  if (rate) {
    const { lastUpdated } = rate
    const isStale = (Date.now() - lastUpdated) >= 5000
    return isStale
  } else {
    return true
  }
})

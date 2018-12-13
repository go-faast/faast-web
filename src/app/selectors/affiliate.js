import { values, mapValues } from 'lodash'
import { createSelector } from 'reselect'

const getAffiliateState = ({ affiliate }) => affiliate

// App selectors
export const isAffiliateLoggedIn = createSelector(getAffiliateState, ({ loggedIn }) => loggedIn)
export const affiliateStats = createSelector(getAffiliateState, ({ stats }) => stats)
export const affiliateId = createSelector(getAffiliateState, ({ affiliate_id }) => affiliate_id)
export const secretKey = createSelector(getAffiliateState, ({ secret_key }) => secret_key)
export const swapPieChartData = createSelector(getAffiliateState, ({ stats: { by_currency } }) => {
  return values(mapValues(by_currency, (value, key) => { value.name = key; return value }))
    .filter((x) => x.swaps_completed > 0)
    .map(({ swaps_completed, name }) => { return { sliced: false, y: swaps_completed, name }})
})
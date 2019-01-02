import { values, mapValues } from 'lodash'
import { createSelector } from 'reselect'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'
import { createSwapExtender } from './swap'

const getAffiliateState = ({ affiliate }) => affiliate

// Affiliate selectors
export const isAffiliateLoggedIn = createSelector(getAffiliateState, ({ loggedIn }) => loggedIn)
export const getSwapChartData = createSelector(getAffiliateState, ({ swapChartData }) => swapChartData)
export const isSwapChartLoading = createSelector(getAffiliateState, ({ swapChartLoading }) => swapChartLoading)
export const isAffiliateDataStale = createSelector(getAffiliateState, affiliate => {
  const { lastUpdated } = affiliate
  return (Date.now() - lastUpdated) >= 300000
})
export const areSwapsLoading = createSelector(getAffiliateState, ({ swapsLoading }) => swapsLoading)
export const affiliateStats = createSelector(getAffiliateState, ({ stats }) => stats)
export const affiliateSwaps = createSelector(
  getAffiliateState,
  getAllAssets,
  getAllWallets,
  getAllTxs,
  ({ swaps }, allAssets, allWallets, allTxs) => mapValues(swaps, createSwapExtender(allAssets, allWallets, allTxs)))

export const affiliateSwapsArray = createSelector(affiliateSwaps, Object.values)
export const affiliateSentSwapsArray = createSelector(affiliateSwapsArray, (swaps) => 
  swaps.filter(({ status: { code } }) =>
    code === 'complete' || code === 'failed'))
export const getAffiliateBalance = createSelector(getAffiliateState, ({ balance }) => balance)
export const affiliateId = createSelector(getAffiliateState, ({ affiliate_id }) => affiliate_id)
export const getAffiliateWithdrawals = createSelector(getAffiliateState, ({ withdrawals }) => withdrawals)
export const getAffiliateWithdrawalsArray = createSelector(getAffiliateWithdrawals, withdrawals => {
  const arr =  Object.values(withdrawals)
  return arr.sort((a, b) => { 
    return new Date(b.created) - new Date(a.created);
  })
})
export const secretKey = createSelector(getAffiliateState, ({ secret_key }) => secret_key)
export const swapPieChartData = createSelector(getAffiliateState, ({ stats: { by_currency } }) => {
  return values(mapValues(by_currency, (value, key) => { value.name = key; return value }))
    .filter((x) => x.swaps_completed > 0)
    .map((completed) => { 
      const { swaps_completed, name } = completed
      return { sliced: false, y: swaps_completed, name }})
})
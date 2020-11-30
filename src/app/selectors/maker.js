import { mapValues } from 'lodash'
import { createSelector } from 'reselect'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'
import { createSwapExtender } from './swap'

const getMakerState = ({ maker }) => maker

// Maker selectors
export const isMakerLoggedIn = createSelector(getMakerState, ({ loggedIn }) => loggedIn)
export const hasLoginError = createSelector(getMakerState, ({ loginError }) => loginError)
export const isLoadingData = createSelector(getMakerState, ({ loadingData }) => loadingData)
export const isMakerDataStale = createSelector(getMakerState, makerState => {
  const { lastUpdated } = makerState
  return (Date.now() - lastUpdated) >= 300000
})
export const areSwapsLoading = createSelector(getMakerState, ({ swapsLoading }) => swapsLoading)
export const makerStats = createSelector(getMakerState, ({ stats }) => stats)
export const makerSwaps = createSelector(
  getMakerState,
  getAllAssets,
  getAllWallets,
  getAllTxs,
  ({ swaps }, allAssets, allWallets, allTxs) => mapValues(swaps, createSwapExtender(allAssets, allWallets, allTxs)))

export const makerSwapsArray = createSelector(makerSwaps, Object.values)
export const getMakerBalances = createSelector(getMakerState, ({ balances }) => balances)
export const getMakerProfile = createSelector(getMakerState, ({ profile }) => profile)
export const getMakerStats = createSelector(getMakerState, ({ stats }) => stats)
export const getMakerProfit = createSelector(getMakerStats, (stats) => {
  if (stats && stats.expenses) {
    const profit = stats.revenue && stats.revenue.maker_revenue_btc - stats.expenses.total
    return profit
  } else {
    return 0
  }
})
export const makerId = createSelector(getMakerProfile, ({ makerId }) => makerId)
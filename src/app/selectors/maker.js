import { mapValues } from 'lodash'
import { createSelector } from 'reselect'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'
import { createSwapExtender } from './swap'
import { toBigNumber } from 'Utilities/numbers'

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
export const getTotalBalanceBTC = createSelector(getMakerProfile, ({ profile }) => { 
  const approxBTC = profile.approxTotalBalances.total.BTC
  const feesOwed = profile.feesOwed
  return parseFloat(approxBTC) - parseFloat(feesOwed)
})
export const getCapacityAddress = createSelector(getMakerProfile, ({ capacityAddress }) => capacityAddress)
export const getMakerSecret = createSelector(getMakerProfile, ({ llamaSecret }) => llamaSecret)
export const isMakerActivated = createSelector(getMakerProfile, ({ isSuspended }) => !isSuspended)
export const getMakerStats = createSelector(getMakerState, ({ stats }) => stats)
export const getMakerProfitUSD = createSelector(getMakerStats, (stats) => {
  if (stats && stats.expenses) {
    const profit = stats.revenue && stats.revenue.maker_rewards_usd - stats.expenses.total_usd
    return profit
  } else {
    return 0
  }
})
export const getMakerProfitBTC = createSelector(getMakerStats, (stats) => {
  if (stats && stats.expenses) {
    const profit = stats.revenue && stats.revenue.maker_rewards_btc - stats.expenses.total_btc
    return profit
  } else {
    return 0
  }
})
export const makerId = createSelector(getMakerProfile, ({ makerId }) => makerId)
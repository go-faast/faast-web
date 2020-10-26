import { values, mapValues } from 'lodash'
import { createSelector } from 'reselect'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'
import { createSwapExtender } from './swap'

const getMakerState = ({ maker }) => maker

// Maker selectors
export const isMakerLoggedIn = createSelector(getMakerState, ({ loggedIn }) => loggedIn)
export const hasLoginError = createSelector(getMakerState, ({ loginError }) => loginError)
export const isLoadingLogin = createSelector(getMakerState, ({ loadingLogin }) => loadingLogin)
export const isMakerDataStale = createSelector(getMakerState, affiliate => {
  const { lastUpdated } = affiliate
  return (Date.now() - lastUpdated) >= 120000
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
export const getMakerProfile = createSelector(getMakerState, ({ balance }) => balance)
export const makerId = createSelector(getMakerState, ({ affiliate_id }) => affiliate_id)
export const secretKey = createSelector(getMakerState, ({ secret_key }) => secret_key)
import { createSelector } from 'reselect'
import config from 'Config'
import { createItemSelector, currySelector } from 'Utilities/selector'
import { toPercentage } from 'Utilities/convert'

import {
  getAllWallets, getWallet, getWalletWithHoldings,
  getWalletHoldingsError, areWalletHoldingsLoaded
} from './wallet'

const { defaultPortfolioId } = config

const getPortfolioState = ({ portfolio }) => portfolio

export const getCurrentPortfolioId = createSelector(getPortfolioState, ({ currentId }) => currentId)
export const getCurrentWalletId = createSelector(getPortfolioState, ({ currentId, currentWalletId }) => currentWalletId || currentId)
export const getAllPortfolioIds = createSelector(getPortfolioState, ({ portfolioIds }) => portfolioIds)

export const getAllPortfolioWalletIds = createSelector(
  getAllPortfolioIds,
  getAllWallets,
  (portfolioIds, allWallets) => portfolioIds.reduce((result, id) => ({ ...result, [id]: allWallets[id].nestedWalletIds }), {})
)

export const getCurrentPortfolio = currySelector(getWallet, getCurrentPortfolioId)
export const getCurrentPortfolioWithHoldings = currySelector(getWalletWithHoldings, getCurrentPortfolioId)
export const areCurrentPortfolioHoldingsLoaded = currySelector(areWalletHoldingsLoaded, getCurrentPortfolioId)
export const getCurrentPortfolioHoldingsError = currySelector(getWalletHoldingsError, getCurrentPortfolioId)
export const getCurrentPortfolioWalletIds = createSelector(getCurrentPortfolio, ({ nestedWalletIds }) => nestedWalletIds)
export const getCurrentPortfolioLabel = createSelector(getCurrentPortfolio, ({ label }) => label)

export const getCurrentPortfolioWithWalletHoldings = (state) => {
  const currentPortfolio = getCurrentPortfolioWithHoldings(state)
  const result = {
    ...currentPortfolio,
    nestedWallets: currentPortfolio.nestedWalletIds
      .map((nestedId) => getWalletWithHoldings(state, nestedId))
      .map((nestedWallet) => ({
        ...nestedWallet,
        weight: toPercentage(nestedWallet.totalFiat, currentPortfolio.totalFiat),
        assetHoldings: nestedWallet.assetHoldings.map((assetHolding) => ({
          ...assetHolding,
          percentage: toPercentage(assetHolding.fiat, currentPortfolio.totalFiat)
        }))
      }))
  }
  return result
}

export const getCurrentWallet = currySelector(getWallet, getCurrentWalletId)
export const getCurrentWalletWithHoldings = currySelector(getWalletWithHoldings, getCurrentWalletId)
export const areCurrentWalletHoldingsLoaded = currySelector(areWalletHoldingsLoaded, getCurrentWalletId)
export const getCurrentWalletHoldingsError = currySelector(getWalletHoldingsError, getCurrentWalletId)

export const getDefaultPortfolio = currySelector(getWallet, defaultPortfolioId)
export const getDefaultPortfolioWithHoldings = currySelector(getWalletWithHoldings, defaultPortfolioId)
export const getDefaultPortfolioWalletIds = createSelector(getCurrentPortfolio, ({ nestedWalletIds }) => nestedWalletIds)

export const isPortfolioEmpty = createItemSelector(getWallet, ({ type, nestedWalletIds }) => type === 'MultiWallet' && nestedWalletIds.length === 0)
export const isCurrentPortfolioEmpty = currySelector(isPortfolioEmpty, getCurrentPortfolioId)
export const isDefaultPortfolioEmpty = (state) => isPortfolioEmpty(state, 'default')

export const canAddWalletsToCurrentPortfolio = createSelector(getCurrentPortfolio, ({ type }) => type === 'MultiWallet')

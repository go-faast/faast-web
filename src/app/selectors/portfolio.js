import { createSelector } from 'reselect'
import config from 'Config'
import { createItemSelector, currySelector } from 'Utilities/selector'
import { toPercentage, toBigNumber } from 'Utilities/convert'
import {
  getAllWallets, getWallet, getWalletWithHoldings, getWalletNestedIds, getWalletTransitiveNestedIds,
  getWalletHoldingsError, areWalletHoldingsLoaded, areWalletBalancesLoaded, getWalletLabel,
  areWalletBalancesUpdating, getAllWalletsArray
} from './wallet'
import { getAllAssetsArray } from 'Selectors/asset'

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
export const areCurrentPortfolioBalancesLoaded = currySelector(areWalletBalancesLoaded, getCurrentPortfolioId)
export const areCurrentPortfolioBalancesUpdating = currySelector(areWalletBalancesUpdating, getCurrentPortfolioId)
export const areCurrentPortfolioHoldingsLoaded = currySelector(areWalletHoldingsLoaded, getCurrentPortfolioId)
export const getCurrentPortfolioHoldingsError = currySelector(getWalletHoldingsError, getCurrentPortfolioId)
export const getCurrentPortfolioWalletIds = currySelector(getWalletNestedIds, getCurrentPortfolioId)
export const getCurrentPortfolioTransitiveWalletIds = currySelector(getWalletTransitiveNestedIds, getCurrentPortfolioId)
export const getCurrentPortfolioLabel = currySelector(getWalletLabel, getCurrentPortfolioId)

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

export const getCurrentPortfolioWithIndividualWalletHoldings = (state) => {
  const currentPortfolio = getCurrentPortfolioWithHoldings(state)
  const result = {
    ...currentPortfolio,
    nestedWallets: currentPortfolio.transitiveNestedWalletIds.filter(id => id !== currentPortfolio.nestedWalletIds[0])
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
  console.log('result', result)
  return result
}

export const getCurrentWallet = currySelector(getWallet, getCurrentWalletId)
export const getCurrentWalletWithHoldings = currySelector(getWalletWithHoldings, getCurrentWalletId)
export const areCurrentWalletHoldingsLoaded = currySelector(areWalletHoldingsLoaded, getCurrentWalletId)
export const getCurrentWalletHoldingsError = currySelector(getWalletHoldingsError, getCurrentWalletId)

export const getDefaultPortfolio = currySelector(getWallet, defaultPortfolioId)
export const getDefaultPortfolioWithHoldings = currySelector(getWalletWithHoldings, defaultPortfolioId)
export const getDefaultPortfolioWalletIds = currySelector(getWalletNestedIds, defaultPortfolioId)
export const getDefaultPortfolioTransitiveWalletIds = currySelector(getWalletTransitiveNestedIds, defaultPortfolioId)
export const isWalletAlreadyInDefaultPortfolio = createSelector(
  getDefaultPortfolioTransitiveWalletIds,
  (_, walletId) => walletId,
  (walletIds, walletId) => walletIds.includes(walletId))

export const isPortfolioEmpty = createItemSelector(
  getWallet,
  (wallet) => !wallet || wallet.type === 'MultiWallet' && wallet.nestedWalletIds.length === 0
)
export const isCurrentPortfolioEmpty = currySelector(isPortfolioEmpty, getCurrentPortfolioId)
export const isDefaultPortfolioEmpty = (state) => isPortfolioEmpty(state, 'default')

export const canAddWalletsToCurrentPortfolio = createSelector(getCurrentPortfolio, ({ type }) => type === 'MultiWallet')

export const getCurrentPortfolioWalletsForSymbol = createItemSelector(
  getCurrentPortfolio,
  (_, symbol) => symbol,
  (portfolio, symbol) => !(portfolio && portfolio.nestedWallets)
    ? []
    : portfolio.nestedWallets.filter(({ supportedAssets }) => supportedAssets.includes(symbol)))


export const getAllAssetsWithHoldings = createSelector(
  getAllAssetsArray,
  getAllWalletsArray,
  (assets, wallets) => {
    return assets.map((asset) => {
      let balance
      wallets.map(({ id, balances }) => {
        if (id === 'default') {
          balance = balances[asset.symbol] || toBigNumber(0)
        }
      })
      asset.balance = balance
      asset.balanceUSD = balance.times(asset.price)
      return asset
    })
  }
)
export const getAllActiveAssetsWithHoldings = createSelector(
  getAllAssetsWithHoldings,
  (assets) => assets.filter(a => a.balance.gt(0) || (a.deposit || a.receive)))

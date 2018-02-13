import { createSelector } from 'reselect'
import createCachedSelector from 're-reselect'

import { toBigNumber, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding } from 'Utilities/helpers'

/** Creates a new selector by passing the results of argSelectors into originalSelector as arguments */
const wrapSelectorArgs = (originalSelector, ...argSelectors) => (state) => originalSelector(state, ...argSelectors.map((argSelector) => argSelector(state)))

/** Selector that returns the first non-state argument passed to it */
const selectItemId = (state, id) => id

/** Creates a cached selector that accepts an item ID as an arg */
const createItemSelector = (...createSelectorArgs) => createCachedSelector(...createSelectorArgs)(selectItemId)


// Root selectors
const getAppState = ({ app }) => app
const getAssetState = ({ assets }) => assets
const getPortfolioState = ({ portfolio }) => portfolio
const getWalletState = ({ wallets }) => wallets

// App selectors
export const isAppReady = createSelector(getAppState, ({ ready }) => ready)
export const getAppError = createSelector(getAppState, ({ error }) => error)

// Asset selectors
export const areAssetsLoaded = createSelector(getAssetState, ({ loaded }) => loaded)
export const getAssetsLoadingError = createSelector(getAssetState, ({ loadingError }) => loadingError)
export const areAssetPricesLoaded = createSelector(getAssetState, ({ loaded, pricesLoaded }) => loaded && pricesLoaded)
export const getAssetPricesError = createSelector(getAssetState, ({ loadingError, pricesError }) => loadingError || pricesError)
export const getAllAssets = createSelector(getAssetState, ({ data }) => data)
export const getAllAssetsArray = createSelector(getAllAssets, Object.values)

// Wallet selectors
export const getAllWallets = getWalletState

export const getWallet = createItemSelector(
  getAllWallets,
  selectItemId,
  (allWallets, id) => {
    const wallet = allWallets[id]
    if (wallet) {
      return {
        ...wallet,
        nestedWallets: wallet.nestedWalletIds.map((nestedWalletId) => allWallets[nestedWalletId])
      }
    }
  }
)

export const getWalletParents = createItemSelector(
  getAllWallets,
  selectItemId,
  (allWallets, id) => Object.values(allWallets).reduce(
    (result, parent) => (parent && parent.type === 'MultiWallet' && parent.nestedWalletIds.includes(id)) ? [...result, parent] : result,
    [])
)

export const getWalletWithHoldings = createItemSelector(
  getWallet,
  getAllAssets,
  (wallet, assets) => {
    let totalFiat = toBigNumber(0)
    let totalFiat24hAgo = toBigNumber(0)
    const balances = wallet.balances || {}
    let assetHoldings = wallet.supportedAssets
      .map((symbol) => assets[symbol])
      .filter((asset) => typeof asset === 'object' && asset !== null)
      .map((asset) => {
        const { symbol, ERC20, price = toBigNumber(0), change24 = toBigNumber(0) } = asset
        const balance = balances[symbol] || toBigNumber(0)
        const shown = balance.greaterThan(0) || !ERC20
        const fiat = toUnit(balance, price, 2)
        const price24hAgo = price.div(change24.plus(100).div(100))
        const fiat24hAgo = toUnit(balance, price24hAgo, 2)
        totalFiat = totalFiat.plus(fiat)
        totalFiat24hAgo = totalFiat24hAgo.plus(fiat24hAgo)
        return {
          ...asset,
          balance,
          shown,
          fiat,
          fiat24hAgo,
        }
      })
      .map((holding) => ({
        ...holding,
        percentage: toPercentage(holding.fiat, totalFiat)
      }))
      .sort((a, b) => b.fiat.minus(a.fiat).toNumber())
    assetHoldings = fixPercentageRounding(assetHoldings, totalFiat)
    const totalChange = totalFiat.minus(totalFiat24hAgo).div(totalFiat24hAgo).times(100)
    const result = {
      ...wallet,
      totalFiat,
      totalFiat24hAgo,
      totalChange,
      assetHoldings,
    }
    return result
  }
)

export const areWalletHoldingsLoaded = createItemSelector(
  getWallet,
  areAssetPricesLoaded,
  (wallet, assetPricesLoaded) => wallet.balancesLoaded && assetPricesLoaded
)

export const getWalletHoldingsError = createItemSelector(
  getWallet,
  getAssetPricesError,
  (wallet, assetPricesError) => wallet.balancesError || assetPricesError
)

// Portfolio selectors
export const getCurrentPortfolioId = createSelector(getPortfolioState, ({ currentId }) => currentId)
export const getCurrentWalletId = createSelector(getPortfolioState, ({ currentId, currentWalletId }) => currentWalletId || currentId)
export const getAllPortfolioIds = createSelector(getPortfolioState, ({ portfolioIds }) => portfolioIds)

export const getCurrentPortfolio = wrapSelectorArgs(getWallet, getCurrentPortfolioId)
export const getCurrentPortfolioWithHoldings = wrapSelectorArgs(getWalletWithHoldings, getCurrentPortfolioId)
export const areCurrentPortfolioHoldingsLoaded = wrapSelectorArgs(areWalletHoldingsLoaded, getCurrentPortfolioId)
export const getCurrentPortfolioHoldingsError = wrapSelectorArgs(getWalletHoldingsError, getCurrentPortfolioId)
export const getCurrentPortfolioWalletIds = createSelector(getCurrentPortfolio, ({ nestedWalletIds }) => nestedWalletIds)

export const getCurrentWallet = wrapSelectorArgs(getWallet, getCurrentWalletId)
export const getCurrentWalletWithHoldings = wrapSelectorArgs(getWalletWithHoldings, getCurrentWalletId)
export const areCurrentWalletHoldingsLoaded = wrapSelectorArgs(areWalletHoldingsLoaded, getCurrentWalletId)
export const getCurrentWalletHoldingsError = wrapSelectorArgs(getWalletHoldingsError, getCurrentWalletId)

export const isCurrentPortfolioEmpty = createSelector(getCurrentPortfolio, ({ type, nestedWalletIds }) => type === 'MultiWallet' && nestedWalletIds.length === 0)

export const canAddWalletsToCurrentPortfolio = createSelector(getCurrentPortfolio, ({ type }) => type === 'MultiWallet')

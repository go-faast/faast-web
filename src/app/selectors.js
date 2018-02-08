import { createSelector as reselect } from 'reselect'

import { toBigNumber, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding } from 'Utilities/helpers'

export const isAppReady = ({ app }) => app.ready
export const getAppError = ({ app }) => app.error

const getAssetState = ({ assets }) => assets

export const areAssetsLoaded = reselect(getAssetState, ({ loaded }) => loaded)
export const getAssetsLoadingError = reselect(getAssetState, ({ loadingError }) => loadingError)
export const areAssetPricesLoaded = reselect(getAssetState, ({ loaded, pricesLoaded }) => loaded && pricesLoaded)
export const getAssetPricesError = reselect(getAssetState, ({ loadingError, pricesError }) => loadingError || pricesError)
export const getAllAssets = reselect(getAssetState, ({ data }) => data)
export const getAllAssetsArray = reselect(getAllAssets, Object.values)

export const getCurrentPortfolioId = ({ portfolio: { currentId } }) => currentId
export const getCurrentWalletId = ({ portfolio: { currentId, currentWalletId } }) => currentWalletId || currentId
export const getAllWallets = ({ wallets }) => wallets

export const createWalletSelector = (walletIdSelector) => reselect(getAllWallets, walletIdSelector, (wallets, id) => {
  const wallet = wallets[id]
  if (wallet) {
    return {
      ...wallet,
      nestedWallets: wallet.nestedWalletIds.map((nestedWalletId) => wallets[nestedWalletId])
    }
  }
})
export const getWallet = createWalletSelector((_, { id }) => id)
export const getCurrentPortfolio = createWalletSelector(getCurrentPortfolioId)
export const getCurrentWallet = createWalletSelector(getCurrentWalletId)

export const getParentWallets = reselect(
  (_, { id }) => id,
  getAllWallets,
  (walletId, allWallets) => Object.values(allWallets).reduce(
    (result, parent) => (parent && parent.type === 'MultiWallet' && parent.nestedWalletIds.includes(walletId)) ? [...result, parent] : result,
    []))

export const isCurrentPortfolioEmpty = reselect(getCurrentPortfolio, ({ type, nestedWalletIds }) => type === 'MultiWallet' && nestedWalletIds.length === 0)

export const createWalletHoldingsSelector = (walletSelector) => reselect(
  walletSelector,
  getAllAssets,
  (wallet, assets) => {
    let totalFiat = toBigNumber(0);
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
      .sort((a, b) => a.fiat.minus(b.fiat).toNumber())
      .reverse()
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
  })

export const createWalletHoldingsLoadedSelector = (walletSelector) => reselect(
  walletSelector,
  areAssetPricesLoaded,
  (wallet, assetPricesLoaded) => wallet.balancesLoaded && assetPricesLoaded)

export const createWalletHoldingsErrorSelector = (walletSelector) => reselect(
  walletSelector,
  getAssetPricesError,
  (wallet, assetPricesError) => wallet.balancesError || assetPricesError)

export const getCurrentPortfolioWithHoldings = createWalletHoldingsSelector(getCurrentPortfolio)
export const areCurrentPortfolioHoldingsLoaded = createWalletHoldingsLoadedSelector(getCurrentPortfolio)
export const getCurrentPortfolioHoldingsError = createWalletHoldingsErrorSelector(getCurrentPortfolio)

export const getCurrentWalletWithHoldings = createWalletHoldingsSelector(getCurrentWallet)
export const areCurrentWalletHoldingsLoaded = createWalletHoldingsLoadedSelector(getCurrentWallet)
export const getCurrentWalletHoldingsError = createWalletHoldingsErrorSelector(getCurrentWallet)
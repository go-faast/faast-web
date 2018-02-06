import { createSelector as reselect } from 'reselect'

import { toBigNumber, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding } from 'Utilities/helpers'

export const isAppReady = ({ app }) => app.ready
export const getAppError = ({ app }) => app.error

export const getAllAssets = ({ assets }) => assets
export const getAllAssetsArray = (state) => Object.values(getAllAssets(state))

export const getAllPortfolios = ({ portfolios }) => portfolios
export const getCurrentPortfolioId = ({ portfolio }) => portfolio.current

export const createPortfolioSelector = (portfolioIdSelector) => reselect(getAllPortfolios, portfolioIdSelector, (portfolios, id) => portfolios[id])
export const getPortfolio = createPortfolioSelector((_, { portfolioId }) => portfolioId)
export const getCurrentPortfolio = createPortfolioSelector(getCurrentPortfolioId)

export const getWalletIdsInPortfolio = reselect(getPortfolio, (portfolio) => portfolio && portfolio.wallets || [])

export const getAllWallets = ({ wallets }) => wallets

export const createWalletSelector = (walletIdSelector) => reselect(getAllWallets, walletIdSelector, (wallets, id) => wallets[id])
export const getWallet = createWalletSelector((_, { walletId }) => walletId)
export const getCurrentWallet = createWalletSelector(getCurrentPortfolioId)

export const getPortfolioIdsForWallet = reselect(
  getAllPortfolios,
  getWallet,
  (portfolios, { id: walletId }) => portfolios
    .filter(({ wallets }) => wallets.includes(walletId))
    .map(({ id }) => id)
)

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
    return {
      totalFiat,
      totalFiat24hAgo,
      totalChange,
      assetHoldings,
    }
  })

export const getWalletWithHoldings = createWalletHoldingsSelector(getWallet)

export const getCurrentPortfolioWithHoldings = reselect(
  getCurrentPortfolio,
  createWalletHoldingsSelector(getCurrentWallet),
  (portfolio, holdings) => ({
    ...portfolio,
    ...holdings,
  }))
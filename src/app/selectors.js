import { createSelector as reselect } from 'reselect'

import { toBigNumber, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding } from 'Utilities/helpers'

export const isAppReady = ({ app }) => app.ready
export const getAppError = ({ app }) => app.error

export const getAllAssets = ({ assets }) => assets
export const getAllAssetsArray = (state) => Object.values(getAllAssets(state))

export const getAllPortfolios = ({ portfolios }) => portfolios
export const getCurrentPortfolioId = ({ portfolio }) => portfolio.current

export const getAllWallets = ({ wallets }) => wallets
export const getWallet = (walletId) => (state) => getAllWallets(state)[walletId]
export const getCurrentWallet = (state) => getWallet((getCurrentPortfolio(state) || {}).id)(state) || {}
export const getPortfolioIdsForWallet = (walletId) => (state) =>
  Object.values(getAllPortfolios(state))
    .filter(({ wallets }) => wallets.includes(walletId))
    .map(({ id }) => id)

export const getCurrentPortfolio = reselect(
  getCurrentPortfolioId,
  getAllPortfolios,
  getAllWallets,
  getAllAssets,
  (portfolioId, portfolios, wallets, assets) => {
    let totalFiat = toBigNumber(0);
    let totalFiat24hAgo = toBigNumber(0)
    const wallet = wallets[portfolioId]
    const portfolio = portfolios[portfolioId]
    let holdings = wallet.supportedAssets
      .map((symbol) => assets[symbol])
      .filter((asset) => typeof asset === 'object' && asset !== null)
      .map((asset) => {
        const { symbol, ERC20, price = toBigNumber(0), change24 = toBigNumber(0) } = asset
        const balance = (wallet.balances || {})[symbol] || toBigNumber(0)
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
    holdings = fixPercentageRounding(holdings, totalFiat)
    const totalChange = totalFiat.minus(totalFiat24hAgo).div(totalFiat24hAgo).times(100)
    console.log(holdings)
    return {
      ...portfolio,
      id: wallet.id,
      total: totalFiat,
      total24hAgo: totalFiat24hAgo,
      totalChange,
      list: holdings,
    }
  })
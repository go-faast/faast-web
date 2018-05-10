import { createSelector } from 'reselect'

import { toBigNumber, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding, reduceByKey } from 'Utilities/helpers'
import { createItemSelector, selectItemId } from 'Utilities/selector'

import { getAllAssets, areAssetPricesLoaded, getAssetPricesError } from './asset'

const getWalletState = ({ wallet }) => wallet

export const getAllWallets = getWalletState
export const getAllWalletsArray = createSelector(getAllWallets, Object.values)

export const getWallet = createItemSelector(
  getAllWallets,
  selectItemId,
  (allWallets, id) => {
    const wallet = allWallets[id]
    if (!wallet) {
      return wallet
    }
    const nestedWallets = wallet.nestedWalletIds.map((nestedWalletId) => allWallets[nestedWalletId])
    let { balances, balancesLoaded, balancesUpdating, balancesError } = wallet
    if (wallet.type === 'MultiWallet') {
      balances = reduceByKey(nestedWallets.map((w) => w.balances), (x, y) => x.plus(y), toBigNumber(0))
      balancesLoaded = nestedWallets.every((w) => w.balancesLoaded)
      balancesUpdating = nestedWallets.some((w) => w.balancesUpdating)
      balancesError = nestedWallets.map((w) => w.balancesError).find(Boolean) || ''
    }
    return {
      ...wallet,
      nestedWallets,
      balances,
      balancesLoaded,
      balancesUpdating,
      balancesError
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

export const areWalletHoldingsLoaded = createItemSelector(
  getWallet,
  areAssetPricesLoaded,
  (wallet, assetPricesLoaded) => wallet && wallet.balancesLoaded && assetPricesLoaded
)

export const getWalletHoldingsError = createItemSelector(
  getWallet,
  getAssetPricesError,
  (wallet, assetPricesError) => wallet && wallet.balancesError || assetPricesError
)

export const getWalletWithHoldings = createItemSelector(
  getWallet,
  getAllAssets,
  areWalletHoldingsLoaded,
  getWalletHoldingsError,
  (wallet, assets, holdingsLoaded, holdingsError) => {
    if (!wallet) return null
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
      .filter(({ shown }) => shown)
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
      holdingsLoaded,
      holdingsError,
    }
    return result
  }
)

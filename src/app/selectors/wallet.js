import { createSelector } from 'reselect'
import { union, flatMap } from 'lodash'

import { ZERO, toUnit, toPercentage } from 'Utilities/convert'
import { fixPercentageRounding, reduceByKey, mapValues } from 'Utilities/helpers'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'

import { getAllAssets, areAssetPricesLoaded, getAssetPricesError } from './asset'

const getWalletState = ({ wallet }) => wallet

const doGetWallet = (walletState, id) => {
  const wallet = walletState[id]
  if (!wallet) {
    return wallet
  }
  const nestedWallets = wallet.nestedWalletIds.map((nestedWalletId) => doGetWallet(walletState, nestedWalletId)).filter(Boolean)
  let { balances, balancesLoaded, balancesUpdating, balancesError, supportedAssets, unsendableAssets } = wallet
  if (wallet.type.includes('MultiWallet')) {
    if (nestedWallets.length) {
      balances = reduceByKey(nestedWallets.map((w) => w.balances), (x, y) => x.plus(y), ZERO)
      balancesLoaded = nestedWallets.every((w) => w.balancesLoaded)
      balancesUpdating = nestedWallets.some((w) => w.balancesUpdating)
      balancesError = nestedWallets.map((w) => w.balancesError).find(Boolean) || ''
      supportedAssets = union(...nestedWallets.map((w) => w.supportedAssets))
      unsendableAssets = union(...nestedWallets.map((w) => w.unsendableAssets))
    } else {
      balancesLoaded = true
    }
  }
  const transitiveNestedWalletIds = flatMap(nestedWallets, ({ id, transitiveNestedWalletIds }) => [id, ...transitiveNestedWalletIds])
  return {
    ...wallet,
    nestedWallets,
    transitiveNestedWalletIds,
    balances,
    balancesLoaded,
    balancesUpdating,
    balancesError,
    supportedAssets,
    unsendableAssets,
  }
}

export const getWallet = createItemSelector(
  getWalletState,
  selectItemId,
  doGetWallet
)
export const getWalletOrDefault = createItemSelector(getWallet, (wallet) => wallet || {})

export const getAllWallets = (state) => mapValues(getWalletState(state), (_, id) => getWallet(state, id))
export const getAllWalletsArray = createSelector(getAllWallets, Object.values)
export const getAllWalletIds = createSelector(getAllWallets, Object.keys)

export const getLeafWallets = createSelector(
  getAllWalletsArray,
  (wallets) => wallets
    .filter(({ type }) => !type.includes('MultiWallet'))
)
export const getLeafWalletIds = createSelector(
  getLeafWallets,
  (wallets) => wallets
    .map(({ id }) => id)
)

export const isWalletAdded = createItemSelector(getAllWalletIds, selectItemId, (walletIds, walletId) => walletIds.includes(walletId))

export const getWalletParents = createItemSelector(
  getAllWallets,
  selectItemId,
  (allWallets, id) => Object.values(allWallets).reduce(
    (result, parent) => (parent && parent.type.includes('MultiWallet') && parent.nestedWalletIds.includes(id)) ? [...result, parent] : result,
    [])
)

export const areWalletBalancesUpdating = createItemSelector(getWallet, fieldSelector('balancesUpdating'))
export const areWalletBalancesLoaded = createItemSelector(getWallet, fieldSelector('balancesLoaded'))
export const getWalletBalancesError = createItemSelector(getWallet, fieldSelector('balancesError'))
export const getWalletBalances = createItemSelector(getWallet, fieldSelector('balances'))
export const getWalletNestedIds = createItemSelector(getWallet, fieldSelector('nestedWalletIds'))
export const getWalletTransitiveNestedIds = createItemSelector(getWallet, fieldSelector('transitiveNestedWalletIds'))
export const getWalletLabel = createItemSelector(getWallet, fieldSelector('label'))

export const areWalletHoldingsLoaded = createItemSelector(
  areWalletBalancesLoaded,
  areAssetPricesLoaded,
  (balancesLoaded, assetPricesLoaded) => { 
    return balancesLoaded && assetPricesLoaded
  }
)

export const getWalletHoldingsError = createItemSelector(
  getWalletBalancesError,
  getAssetPricesError,
  (balancesError, assetPricesError) => balancesError || assetPricesError
)

export const getWalletWithHoldings = createItemSelector(
  getWallet,
  getAllAssets,
  areWalletHoldingsLoaded,
  getWalletHoldingsError,
  (wallet, assets, holdingsLoaded, holdingsError) => {
    if (!wallet) return null
    let totalFiat = ZERO
    let totalFiat24hAgo = ZERO
    let totalFiat7dAgo = ZERO
    let totalFiat1hAgo = ZERO
    const balances = wallet.balances || {}
    let assetHoldings = wallet.supportedAssets
      .map((symbol) => assets[symbol])
      .filter((asset) => typeof asset === 'object' && asset !== null)
      .map((asset) => {
        const { symbol, price = ZERO, change24 = ZERO, change7d = ZERO, change1 = ZERO } = asset
        const balance = balances[symbol] || ZERO
        const shown = balance.greaterThan(0)
        const fiat = toUnit(balance, price, 2)
        const price24hAgo = price.div(change24.plus(100).div(100))
        const fiat24hAgo = toUnit(balance, price24hAgo, 2)
        const price7dAgo = price.div(change7d.plus(100).div(100))
        const fiat7dAgo = toUnit(balance, price7dAgo, 2)
        const price1hAgo = price.div(change1.plus(100).div(100))
        const fiat1hAgo = toUnit(balance, price1hAgo, 2)
        totalFiat = totalFiat.plus(fiat)
        totalFiat24hAgo = totalFiat24hAgo.plus(fiat24hAgo)
        totalFiat7dAgo = totalFiat7dAgo.plus(fiat7dAgo)
        totalFiat1hAgo = totalFiat1hAgo.plus(fiat1hAgo)

        return {
          ...asset,
          balance,
          shown,
          fiat,
          fiat24hAgo,
          fiat7dAgo,
          fiat1hAgo
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
    const totalChange7d = totalFiat.minus(totalFiat7dAgo).div(totalFiat7dAgo).times(100)
    const totalChange1h = totalFiat.minus(totalFiat1hAgo).div(totalFiat1hAgo).times(100)
    const result = {
      ...wallet,
      totalFiat,
      totalFiat24hAgo,
      totalFiat7dAgo,
      totalFiat1hAgo,
      totalChange,
      totalChange7d,
      totalChange1h,
      assetHoldings,
      holdingsLoaded,
      holdingsError,
    }
    return result
  }
)

export const getHoldingsByAsset = createItemSelector(
  getAllWalletsArray,
  selectItemId,
  (wallets, symbol) => {
    let balance = undefined;
    wallets.map(({ id, balances }) => {
      if (id === 'default') {
        balance = balances[symbol]
      }
    })
    return balance
  }
)

export const areWalletOrdersLoading = createItemSelector(getWallet, fieldSelector('ordersLoading'))
export const areWalletOrdersAllLoaded = createItemSelector(getWallet, fieldSelector('ordersAllLoaded'))
export const areAnyWalletOrdersLoading = createSelector(
  getAllWalletsArray,
  (wallets) => wallets.some((wallet) => wallet.ordersLoading)
)
export const areAllWalletOrdersLoaded = createSelector(
  getAllWalletsArray,
  (wallets) => wallets.every((wallet) => wallet.ordersAllLoaded)
)

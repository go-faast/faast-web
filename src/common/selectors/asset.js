import { createSelector } from 'reselect'
import { localStorageGetJson } from 'Utilities/storage'
import { toBigNumber } from 'Utilities/convert'
import { mapValues } from 'Utilities/helpers'
import { createItemSelector, selectItemId, fieldSelector } from 'Utilities/selector'
import Config from 'Config'

export const getAssetState = ({ asset }) => asset

export const getAllAssets = createSelector(getAssetState, ({ data }) => mapValues(data, (asset) => {
  let { price, change1, change24, change7d, volume24, marketCap, 
    availableSupply, lastUpdatedPrice, symbol, ERC20, validate } = asset
  const bip21Prefix = !ERC20 ? Config.bip21Prefixes[symbol] : Config.bip21Prefixes[validate]
  const watchlist = localStorageGetJson('watchlist') || Config.defaultWatchlist
  const onWatchlist = watchlist.indexOf(symbol) >= 0
  price = toBigNumber(price)
  change24 = toBigNumber(change24)
  change1 = toBigNumber(change1)
  change7d = toBigNumber(change7d)
  return {
    ...asset,
    bip21Prefix,
    onWatchlist,
    price,
    change1,
    change24,
    change7d,
    price1hAgo: price.div(change1.plus(100).div(100)),
    price24hAgo: price.div(change24.plus(100).div(100)),
    price7dAgo: price.div(change7d.plus(100).div(100)),
    volume24: toBigNumber(volume24),
    marketCap: toBigNumber(marketCap),
    availableSupply: toBigNumber(availableSupply),
    lastUpdatedPrice: new Date(Number.parseInt(lastUpdatedPrice) * 1000),
  }
}))

export const getAllAssetsArray = createSelector(getAllAssets, Object.values)
export const getAllAssetSymbols = createSelector(getAllAssets, Object.keys)
export const getNumberOfAssets = createSelector(getAllAssetsArray, (assets) => assets.length)

export const areAssetsLoading = createSelector(getAssetState, ({ loading }) => loading)
export const areAssetsLoaded = createSelector(getAssetState, ({ loaded }) => loaded)
export const getAssetsLoadingError = createSelector(getAssetState, ({ loadingError }) => loadingError)

export const areAssetPricesLoading = createSelector(getAssetState, ({ pricesLoading }) => pricesLoading)
export const areAssetPricesLoaded = createSelector(getAssetState, ({ loaded, pricesLoaded }) => loaded && pricesLoaded)
export const getAssetPricesError = createSelector(getAssetState, ({ loadingError, pricesError }) => loadingError || pricesError)

export const getAsset = createItemSelector(getAllAssets, selectItemId, (allAssets, id) => allAssets[id])
export const getAssetPrice = createItemSelector(getAsset, fieldSelector('price'))
export const getAssetIconUrl = createItemSelector(getAsset, fieldSelector('iconUrl'))
export const isAssetPriceLoading = createItemSelector(getAsset, fieldSelector('priceLoading'))
export const isAssetPriceLoaded = createItemSelector(getAsset, fieldSelector('priceLoaded'))

export const getTrendingPositive = createItemSelector(
  getAllAssetsArray, 
  selectItemId,
  (assets, { sortField, n = 5 }) => {
    return assets.filter(asset => asset.volume24.gt(50000)).sort((a, b) => b[sortField].comparedTo(a[sortField])).slice(0,n)
  })

export const getTrendingNegative = createItemSelector(
  getAllAssetsArray, 
  selectItemId,
  (assets, { sortField, n = 5 }) => {
    return assets.filter(asset => asset.volume24.gt(50000)).sort((a, b) => a[sortField].comparedTo(b[sortField])).slice(0,n)
  })

export const getAssetIndexPage = createItemSelector(
  getAllAssetsArray,
  selectItemId, 
  (allAssets, { page, limit, sortField }) => {
    return allAssets.sort((a, b) => b[sortField].comparedTo(a[sortField])).slice(page * limit, page * limit + limit)
  })

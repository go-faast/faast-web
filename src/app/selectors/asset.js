import { createSelector } from 'reselect'
import { mapValues } from 'Utilities/helpers'
import { localStorageGetJson } from 'Utilities/storage'
import { createItemSelector, fieldSelector, selectItemId } from 'Utilities/selector'
import { getAllAssetsArray, getAllAssets } from 'Common/selectors/asset'

export * from 'Common/selectors/asset'

export const getTop10MarketCapSymbols = createSelector(getAllAssetsArray, (assets) => assets
  .sort((a, b) => b.marketCap.comparedTo(a.marketCap))
  .slice(0, 10).map(a => a.symbol))

export const getAllAssetsWithWatchlist = createSelector(
  getAllAssets, 
  getTop10MarketCapSymbols, 
  (assets, defaultWatchlist) => mapValues(assets, (asset) => {
    const watchlist = localStorageGetJson('watchlist') || defaultWatchlist
    const onWatchlist = watchlist.indexOf(asset.symbol) >= 0
    return ({ ...asset, onWatchlist }) 
  }))

export const getAllAssetsArrayWithWatchlist = createSelector(getAllAssetsWithWatchlist, Object.values)

export const getWatchlistAsset = createItemSelector(getAllAssetsWithWatchlist, selectItemId, (allAssets, id) => allAssets[id])

export const isAssetOnWatchlist = createItemSelector(getWatchlistAsset, fieldSelector('onWatchlist'))

export const getWatchlistSymbols = createSelector(getAllAssetsArrayWithWatchlist, (assets) => { 
  const symbols = []
  assets.forEach(asset => {
    if (asset.onWatchlist) symbols.push(asset.symbol)
  })
  return symbols
})

export const getWatchlist = createSelector(getAllAssetsArrayWithWatchlist, (assets) => assets.filter(asset => asset.onWatchlist).sort((a, b) => b.marketCap.comparedTo(a.marketCap)))
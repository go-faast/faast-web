import { createSelector } from 'reselect'

import { createItemSelector, fieldSelector } from 'Utilities/selector'
import { getAllAssetsArray, getAsset } from 'Common/selectors/asset'

export * from 'Common/selectors/asset'

export const getWatchlist = createSelector(getAllAssetsArray, (assets) => assets.filter(asset => asset.onWatchlist).sort((a, b) => b.marketCap.comparedTo(a.marketCap)))

export const isAssetOnWatchlist = createItemSelector(getAsset, fieldSelector('onWatchlist'))

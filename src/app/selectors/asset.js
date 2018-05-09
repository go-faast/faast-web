import { createSelector } from 'reselect'
import { createItemSelector, selectItemId } from 'Utilities/selector'

const getAssetState = ({ asset }) => asset

// Asset selectors
export const areAssetsLoaded = createSelector(getAssetState, ({ loaded }) => loaded)
export const getAssetsLoadingError = createSelector(getAssetState, ({ loadingError }) => loadingError)
export const areAssetPricesLoaded = createSelector(getAssetState, ({ loaded, pricesLoaded }) => loaded && pricesLoaded)
export const getAssetPricesError = createSelector(getAssetState, ({ loadingError, pricesError }) => loadingError || pricesError)
export const getAllAssets = createSelector(getAssetState, ({ data }) => data)
export const getAllAssetsArray = createSelector(getAllAssets, Object.values)
export const getAsset = createItemSelector(getAllAssets, selectItemId, (allAssets, id) => allAssets[id])
export const getAssetPrice = createItemSelector(getAsset, (asset) => asset ? asset.price : null)
export const getAssetIconUrl = createItemSelector(getAsset, ({ iconUrl }) => iconUrl)

import { createSelector } from 'reselect'

export * from 'Common/selectors/app'

const getAppState = ({ app }) => app

// App selectors
export const isAppReady = createSelector(getAppState, ({ ready }) => ready)
export const getAppError = createSelector(getAppState, ({ error }) => error)
export const shouldRememberWallets = createSelector(getAppState, ({ rememberWallets }) => rememberWallets)
export const isAppRestricted = createSelector(getAppState, ({ restricted }) => restricted)
export const getTradeableAssetFilter = createSelector(getAppState, ({ filterTradeableAssets }) => filterTradeableAssets)
export const getConnectForwardUrl = createSelector(getAppState, ({ connectForwardUrl }) => connectForwardUrl)

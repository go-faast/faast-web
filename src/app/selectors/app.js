import { createSelector } from 'reselect'

export * from 'Common/selectors/app'

const getAppState = ({ app }) => app

// App selectors
export const isAppReady = createSelector(getAppState, ({ ready }) => ready)
export const getAppError = createSelector(getAppState, ({ error }) => error)
export const isAppBlocked = createSelector(getAppState, ({ blocked }) => blocked)
export const isAppRestricted = createSelector(getAppState, ({ restricted }) => restricted)
export const getGeoLimit = createSelector(getAppState, ({ limit }) => limit)
export const getTradeableAssetFilter = createSelector(getAppState, ({ filterTradeableAssets }) => filterTradeableAssets)
export const getSavedSwapWidgetInputs = createSelector(getAppState, ({ savedSwapWidgetInputs }) => savedSwapWidgetInputs)
export const getConnectForwardUrl = createSelector(getAppState, ({ connectForwardUrl }) => connectForwardUrl)
export const shouldShowFeedbackForm = createSelector(getAppState, ({ showFeedbackForm }) => showFeedbackForm)
export const getUserIpAddress = createSelector(getAppState, ({ ip }) => ip)

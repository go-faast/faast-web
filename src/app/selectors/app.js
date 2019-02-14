import { createSelector } from 'reselect'

const getAppState = ({ app }) => app

// App selectors
export const isAppReady = createSelector(getAppState, ({ ready }) => ready)
export const getAppError = createSelector(getAppState, ({ error }) => error)
export const isAppBlocked = createSelector(getAppState, ({ blocked }) => blocked)
export const isAppRestricted = createSelector(getAppState, ({ restricted }) => restricted)
export const getGeoLimit = createSelector(getAppState, ({ limit }) => limit)
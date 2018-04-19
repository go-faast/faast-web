import { createSelector } from 'reselect'

const getAppState = ({ app }) => app

// App selectors
export const isAppReady = createSelector(getAppState, ({ ready }) => ready)
export const getAppError = createSelector(getAppState, ({ error }) => error)
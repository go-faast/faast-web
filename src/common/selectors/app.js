import { createSelector } from 'reselect'

const getAppState = ({ app }) => app

// App selectors
export const getAppLanguage = createSelector(getAppState, ({ language }) => language)
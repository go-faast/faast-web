import { createSelector as reselect } from 'reselect'

export const selectI18n = ({ i18n }) => i18n
export const selectCurrentLanguage = reselect(selectI18n, ({ currentLanguage }) => currentLanguage)
export const selectI18nReady = reselect(selectI18n, ({ ready }) => ready)
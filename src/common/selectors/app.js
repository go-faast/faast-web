import { createSelector } from 'reselect'
import { localStorageGet } from 'Utilities/storage'
import { shortenLanguageCode } from 'Utilities/helpers'

const getAppState = ({ app }) => app

// App selectors
export const getAppLanguage = createSelector(getAppState, ({ language }) => {
  const currentLanguage = shortenLanguageCode(localStorageGet('i18nextLng'))
  if (language !== currentLanguage && currentLanguage) {
    return currentLanguage
  }
  return language
})
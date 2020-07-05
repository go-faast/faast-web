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

export const getGeoLimit = createSelector(getAppState, ({ limit }) => limit)
export const getSavedSwapWidgetInputs = createSelector(getAppState, ({ savedSwapWidgetInputs }) => savedSwapWidgetInputs)
export const shouldShowFeedbackForm = createSelector(getAppState, ({ showFeedbackForm }) => showFeedbackForm)
export const feedbackFormRequestedAsset = createSelector(getAppState, ({ requestedAsset }) => requestedAsset)
export const getUserIpAddress = createSelector(getAppState, ({ ip }) => ip)
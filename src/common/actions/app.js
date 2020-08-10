import { newScopedCreateAction } from 'Utilities/action'
import crypto from 'crypto'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import { localStorageSet, localStorageGet } from 'Utilities/storage'
import { shortenLanguageCode } from 'Utilities/helpers'
import Faast from 'Services/Faast'
import { changeLanguage } from 'Common/actions/i18n'
import { shouldShowFeedbackForm, getUserIpAddress } from 'Selectors/app'
import { postFeedback } from 'Services/Faast'
import { isUnrestricted } from 'Utilities/flags'

import { translations } from 'Config/translations'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (res) => ({ res }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')
export const updateLanguage = createAction('UPDATE_LANGUAGE', (language) => ({ language }))
export const toggleFeedbackForm = createAction('TOGGLE_FEEDBACK', (showFeedbackForm, requestedAsset) => ({ showFeedbackForm, requestedAsset }))
export const updateSwapWidgetInputs = createAction('UPDATE_SWAP_WIDGET_INPUTS', (inputs) => (inputs))

export const languageLoad = () => (dispatch) => {
  let lang = localStorageGet('i18nextLng') || 'en'
  lang = shortenLanguageCode(lang)
  dispatch(selectLanguage(lang))
}

export const fetchGeoRestrictions = () => (dispatch) => Promise.resolve()
  .then(() => {
    const overrides = isUnrestricted() ? {
      restricted: false,
      blocked: false,
      limit: false,
    } : {}
    return Faast.fetchRestrictionsByIp()
      .then((res) => dispatch(restrictionsUpdated({
        ...res,
        ...overrides,
      })))
      .catch((e) => {
        log.error(e)
      })
  }) 

export const saveSwapWidgetInputs = (inputs) => (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(updateSwapWidgetInputs(inputs))
  })  

export const doToggleFeedbackForm = (initialValues) => (dispatch, getState) => {
  const currentState = shouldShowFeedbackForm(getState())
  return dispatch(toggleFeedbackForm(!currentState, initialValues))
}

export const postFeedbackForm = (type, link, email, asset, assetInfo) => (dispatch, getState) => {
  const ipAddress = getUserIpAddress(getState())
  const hash = crypto.createHash('md5').update(ipAddress).digest('hex')
  return postFeedback(type, link, email, asset, assetInfo, hash)
    .then(() => {
      toastr.success('Your feedback has been successfully submitted!')
      return dispatch(doToggleFeedbackForm())
    })
    .catch(() => {
      toastr.success('Your feedback has been successfully submitted!')
      return dispatch(doToggleFeedbackForm())
    })
}

export const selectLanguage = (lang) => (dispatch) => {
  dispatch(changeLanguage(lang))
  dispatch(updateLanguage(lang))
  localStorageSet('i18nextLng', lang)
}

export const correctStaticURL = (currentLanguage) => (dispatch) => {
  if (typeof window !== 'undefined' && currentLanguage) {
    const languageCodes = translations.map(t => t.code)
    if (languageCodes.indexOf(currentLanguage) < 0) {
      currentLanguage = 'en'
      dispatch(selectLanguage(currentLanguage))
    }
    const urlParts = window.location.pathname.split('/')
    const currentUrl = window.location.pathname
    if (urlParts.indexOf(currentLanguage) < 0) {
      if (urlParts.some(x => languageCodes.indexOf(x) >= 0)) {
        if (currentLanguage == 'en') {
          return currentUrl.substring(3) ? `${currentUrl.substring(3)}` : '/'
        }
        return `/${currentLanguage}${currentUrl.substring(3).replace(/\/$/, '')}`
      } else {
        if (currentLanguage == 'en') {
          return `${currentUrl}`
        }
        return `/${currentLanguage}${currentUrl.replace(/\/$/, '')}`
      }
    }
  }
}

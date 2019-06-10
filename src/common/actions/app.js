import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import { localStorageSet, localStorageGet } from 'Utilities/storage'
import { shortenLanguageCode } from 'Utilities/helpers'
import Faast from 'Services/Faast'
import { changeLanguage } from 'Common/actions/i18n'

import { translations } from 'Config/translations'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (res) => ({ res }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')
export const updateLanguage = createAction('UPDATE_LANGUAGE', (language) => ({ language }))

export const languageLoad = () => (dispatch) => {
  let lang = localStorageGet('i18nextLng') || 'en'
  lang = shortenLanguageCode(lang)
  dispatch(selectLanguage(lang))
}

export const fetchGeoRestrictions = () => (dispatch) => Promise.resolve()
  .then(() => {
    return Faast.fetchRestrictionsByIp()
      .then((res) => dispatch(restrictionsUpdated(res)))
      .catch((e) => {
        log.error(e)
      })
  }) 

export const selectLanguage = (lang) => (dispatch) => {
  dispatch(changeLanguage(lang))
  dispatch(updateLanguage(lang))
  localStorageSet('i18nextLng', lang)
}

export const correctStaticURL = (currentLanguage) => () => {
  if (typeof window !== 'undefined' && currentLanguage) {
    const languageCodes = translations.map(t => t.code)
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
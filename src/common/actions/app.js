import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import { localStorageSet, localStorageGet } from 'Utilities/storage'
import { shortenLanguageCode } from 'Utilities/helpers'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (res) => ({ res }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')
export const updateLanguage = createAction('UPDATE_LANGUAGE', (language) => ({ language }))

export const staticAppLoad = () => (dispatch) => {
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
  dispatch(updateLanguage(lang))
  localStorageSet('i18nextLng', lang)
}

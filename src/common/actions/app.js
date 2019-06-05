import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import Faast from 'Services/Faast'

const createAction = newScopedCreateAction(__filename)

export const restrictionsUpdated = createAction('UPDATE_RESTRICTIONS', (res) => ({ res }))
export const restrictionsError = createAction('RESTRICTIONS_ERROR')
export const updateLanguage = createAction('UPDATE_LANGUAGE', (language) => ({ language }))

export const staticAppLoad = () => (dispatch) => {
  if (localStorage) {
    let lang = localStorage.getItem('i18nextLng') || 'en'
    if (lang.indexOf('-') >= 0) {
      lang = lang.substring(0, lang.indexOf('-')).toLowerCase()
    }
    dispatch(selectLanguage(lang))
  }
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
  if (localStorage) {
    localStorage.setItem('i18nextLng', lang)
  }
}

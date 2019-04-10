import { createAction } from 'redux-act'

import i18n from '../../app/i18n'

export const i18nInitialized = createAction('i18nInitialized')
export const namespaceLoaded = createAction('namespaceLoaded')
export const languageChanged = createAction('languageChanged', (language) => ({ language }))
export const languageChanging = createAction('languageChanging', (language) => ({ language }))
export const changeLanguage = (language) => (dispatch) => {
  dispatch(languageChanging(language))
  return new Promise((resolve, reject) =>
    i18n.changeLanguage(language, (err) => {
      if (err) reject(err)
      resolve()
    }))
}


export default {
  i18nInitialized,
  namespaceLoaded,
  languageChanged,
  languageChanging,
  changeLanguage,
}
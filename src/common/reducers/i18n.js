import { createReducer } from 'redux-act'
import { union, mergeWith } from 'lodash'

import { getLanguagePart } from 'Utilities/i18n'
import { i18nInitialized, languageChanging, languageChanged, namespaceLoaded } from 'Actions/i18n'

const setReady = (state) => ({
  ...state,
  ready: (state.loadedNamespaces[state.currentLanguage] || []).includes(state.defaultNamespace)
})

export default createReducer({
  [i18nInitialized]: (state, { defaultNS }) => setReady({
    ...state,
    defaultNamespace: defaultNS,
  }),
  [languageChanging]: (state) => ({ ...state, changingLanguage: true }),
  [languageChanged]: (state, { language }) => setReady({ 
    ...state, 
    changingLanguage: false, 
    currentLanguage: getLanguagePart(language),
  }),
  [namespaceLoaded]: (state, loaded) => setReady({
    ...state,
    loadedNamespaces: mergeWith({}, state.loadedNamespaces, loaded, (obj, src) => {
      if (Array.isArray(obj)) {
        return union(obj, src)
      }
    })
  })
}, {
  ready: false,
  changingLanguage: true,
  currentLanguage: null,
  defaultNamespace: null,
  loadedNamespaces: {}
})
import i18n from 'i18next'
import LngDetector from 'i18next-browser-languagedetector'
import Cache from 'i18next-localstorage-cache'
import XHR from 'i18next-xhr-backend'
import { initReactI18next } from 'react-i18next'

import * as en from 'Src/locales/en/translations.json'

import config from '../config'

console.log(en)

const options = {
  ...config.i18next,

  ns: ['translations'],
  defaultNS: 'translations',

  resources: {
    en: { translations: en },
  },

  saveMissing: true,

  detection: {
    order: ['querystring', 'localStorage', 'navigator', 'htmlTag', 'path', 'subdomain'],
    lookupQuerystring: 'lng',
    lookupLocalStorage: 'i18nextLng',
  },

  react: {
    wait: true,
    bindI18n: 'languageChanged loaded',
    bindStore: false,
    nsMode: 'default',
    hashTransKey: function(defaultValue) {
      throw new Error(`Missing i18nKey prop on Trans component surrounding "${defaultValue}"`)
    }
  },

  interpolation: {
    escapeValue: false // not needed for react!!
  },

  cache: {
    // turn on in production
    enabled: false, // !config.isDev,

    // prefix for stored languages
    prefix: 'i18next_res_',

    // Contrary to cookies behavior, the cache will respect updates to expirationTime.
    // If you set 7 days and later update to 10 days, the cache will persist for 10 days
    expirationTime: (1 * 24 * 60 * 60 * 1000), // 1 day

    // Passing in a versions object (ex.: versions: { en: 'v1.2', fr: 'v1.1' }) will give
    // you control over the cache based on translations version. This setting works along
    // expirationTime, so a cached translation will still expire even though the version
    // did not change. You can still set expirationTime far into the future to avoid this.
    versions: {}
  },
  
  parseMissingKeyHandler: function (key) {
    if (config.isDev) {
      console.error('Key missing: ', key); // eslint-disable-line
    }
    return ''
  },
}

// if (process.env.NODE_ENV === 'development') {  
//   i18n.use(require('locize-editor'))
// }

i18n
  .use(initReactI18next)
  .use(Cache)
  .use(XHR)
  .use(LngDetector)
  .init(options)

export default i18n
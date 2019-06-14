import en from '../locales/en/translations.static.json'
import es from '../locales/es/translations.static.json'
import ja from '../locales/ja/translations.static.json'

import BritishFlag from '../../res/img/united-kingdom.svg'
import JapaneseFlag from '../../res/img/japan.svg'
import SpanishFlag from '../../res/img/spain.svg'

export const translations = [
  {
    translations: en,
    url: '/',
    code: 'en',
    flag:  BritishFlag,
    name: 'English',
    selectable: true,
  },
  {
    translations: es,
    url: '/es',
    code: 'es',
    flag:  SpanishFlag,
    name: 'Español',
    selectable: true,
  },
  {
    translations: ja,
    url: '/ja',
    code: 'ja',
    flag:  JapaneseFlag,
    name: '日本語',
    selectable: true,
  },
  {
    translations: en,
    url: '/en',
    code: 'en',
    flag:  BritishFlag,
    name: 'English',
    selectable: false,
  },
]
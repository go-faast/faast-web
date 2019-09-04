import en from '../locales/en/translations.static.json'
import es from '../locales/es/translations.static.json'
import ja from '../locales/ja/translations.static.json'
import ru from '../locales/ru/translations.static.json'
import zh from '../locales/zh/translations.static.json'
import pt from '../locales/pt/translations.static.json'
import fr from '../locales/fr/translations.static.json'
import de from '../locales/de/translations.static.json'

import BritishFlag from '../../res/img/united-kingdom.svg'
import JapaneseFlag from '../../res/img/japan.svg'
import SpanishFlag from '../../res/img/spain.svg'
import RussianFlag from '../../res/img/russia.svg'
import ChineseFlag from '../../res/img/china.svg'
import BrazilianFlag from '../../res/img/brazil.svg'
import FrenchFlag from '../../res/img/france.svg'
import GermanFlag from '../../res/img/germany.svg'

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
    translations: pt,
    url: '/pt',
    code: 'pt',
    flag:  BrazilianFlag,
    name: 'Português Brasil',
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
    translations: ru,
    url: '/ru',
    code: 'ru',
    flag:  RussianFlag,
    name: 'русский',
    selectable: true,
  },
  {
    translations: zh,
    url: '/zh',
    code: 'zh',
    flag:  ChineseFlag,
    name: '简体中文',
    selectable: true,
  },
  {
    translations: fr,
    url: '/fr',
    code: 'fr',
    flag:  FrenchFlag,
    name: 'Français',
    selectable: true,
  },
  {
    translations: de,
    url: '/de',
    code: 'de',
    flag:  GermanFlag,
    name: 'Deutsch',
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
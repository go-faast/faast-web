import i18n from '../app/i18n'

export const i18nTranslate = (key, fallback) => {
  const t = i18n.t.bind(i18n)
  return t(key, fallback)
}
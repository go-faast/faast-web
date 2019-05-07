
export function localizeDisclosure (disclosure, currentLanguage) {
  if (!disclosure) {
    return null
  }
  if (!currentLanguage) {
    return disclosure
  }
  return {
    ...disclosure,
    ...disclosure.localized[currentLanguage],
    language: currentLanguage
  }
}

const languageNames = {
  'en': 'English',
  'fr': 'Français',
}

export function getLanguagePart(locale) {
  return locale.split('-')[0]
}

export function getLanguageName(locale) {
  return languageNames[getLanguagePart(locale)]
}

const switchLanguagePairs = {
  'fr': 'en',
  'en': 'fr',
}

export function getSwitchPair(locale) {
  return switchLanguagePairs[getLanguagePart(locale)]
}

export default { localizeDisclosure, getLanguageName, getLanguagePart, getSwitchPair }

import { parseJson, stringifyJson } from 'Utilities/helpers'

// https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API/Using_the_Web_Storage_API
export const storageAvailable = (type) => {
  try {
    var storage = window[type]
    var x = '__storage_test__'
    storage.setItem(x, x)
    storage.removeItem(x)
    return true
  } catch (e) {
    return e instanceof window.DOMException && (
      // everything except Firefox
      e.code === 22 ||
      // Firefox
      e.code === 1014 ||
      // test name field too, because code might not be present
      // everything except Firefox
      e.name === 'QuotaExceededError' ||
      // Firefox
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED') &&
      // acknowledge QuotaExceededError only if there's something already stored
      storage.length !== 0
  }
}

const storageGet = (storageType, key) => {
  if (storageAvailable(storageType)) {
    return window[storageType].getItem(key)
  } else {
    return null
  }
}

const storageGetJson = (storageType, key) => parseJson(storageGet(storageType, key))

const storageSet = (storageType, key, value) => {
  if (storageAvailable(storageType)) {
    window[storageType].setItem(key, value)
  }
}

const storageSetJson = (storageType, key, obj) => storageSet(storageType, key, stringifyJson(obj))

const storageRemove = (storageType, key) => {
  if (storageAvailable(storageType)) {
    window[storageType].removeItem(key)
  }
}

const storageClear = (storageType) => {
  if (storageAvailable(storageType)) {
    window[storageType].clear()
  }
}

/** Iterate all storage items. `cb` takes (key, value) as args */
const storageForEach = (storageType, cb) => {
  if (storageAvailable(storageType)) {
    const storage = window[storageType]
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i)
      cb(key, storage.getItem(key))
    }
  }
}

export const sessionStorageGet = (key) => storageGet('sessionStorage', key)

export const sessionStorageGetJson = (key) => storageGetJson('sessionStorage', key)

export const sessionStorageSet = (key, value) => storageSet('sessionStorage', key, value)

export const sessionStorageSetJson = (key, obj) => storageSetJson('sessionStorage', key, obj)

export const sessionStorageRemove = (key) => storageRemove('sessionStorage', key)

export const sessionStorageClear = () => storageClear('sessionStorage')

export const sessionStorageForEach = (cb) => storageForEach('sessionStorage', cb)

export const localStorageGet = (key) => storageGet('localStorage', key)

export const localStorageGetJson = (key) => storageGetJson('localStorage', key)

export const localStorageSet = (key, value) => storageSet('localStorage', key, value)

export const localStorageSetJson = (key, obj) => storageSetJson('localStorage', key, obj)

export const localStorageRemove = (key) => storageRemove('localStorage', key)

export const localStorageClear = () => storageClear('localStorage')

export const localStorageForEach = (cb) => storageForEach('localStorage', cb)

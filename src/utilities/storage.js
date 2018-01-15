import { toChecksumAddress } from 'Utilities/convert'

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

export const sessionStorageSet = (key, value) => {
  sessionStorageClear()
  if (storageAvailable('sessionStorage')) {
    window.sessionStorage.setItem(key, value)
  }
}

export const sessionStorageGet = (key) => {
  if (storageAvailable('sessionStorage')) {
    return window.sessionStorage.getItem(key)
  } else {
    return null
  }
}

export const sessionStorageClear = () => {
  if (storageAvailable('sessionStorage')) {
    window.sessionStorage.clear()
  }
}

export const localStorageSet = (key, value) => {
  if (storageAvailable('localStorage')) {
    window.localStorage.setItem(key, value)
  }
}

export const localStorageGet = (key) => {
  if (storageAvailable('localStorage')) {
    return window.localStorage.getItem(key)
  } else {
    return null
  }
}

export const localStorageRemove = (key) => {
  if (storageAvailable('localStorage')) {
    window.localStorage.removeItem(key)
  }
}

export const restoreFromAddress = (address) => {
  if (!address) return undefined

  try {
    const serialized = localStorageGet(address)
    if (serialized === null) return undefined

    return JSON.parse(serialized)
  } catch (err) {
    return undefined
  }
}

export const saveToAddress = (address, newState) => {
  if (!address) return

  const currentState = restoreFromAddress(address)
  try {
    const serialized = JSON.stringify(Object.assign({}, currentState, newState))
    localStorageSet(address, serialized)
  } catch (err) {
    console.error(err)
  }
}

export const clearSwap = (address) => {
  if (!address) return

  const currentState = restoreFromAddress(address)
  localStorageSet(address, JSON.stringify(Object.assign({}, currentState, { swap: [] })))
}

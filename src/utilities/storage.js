import queryString from 'query-string'
import { statusAllSwaps } from 'Utilities/swap'
import {
  parseEncryptedWalletString,
  parseWalletString,
  toChecksumAddress
} from 'Utilities/wallet'

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

export const restoreSwap = (address) => {
  if (!address) return undefined

  try {
    const serialized = localStorageGet(address)
    if (serialized === null) return undefined

    const swap = JSON.parse(serialized).swap
    const status = statusAllSwaps(swap)
    if (status === 'unavailable' || status === 'unsigned' || status === 'unsent') return undefined

    return swap
  } catch (err) {
    return undefined
  }
}

export const saveSwap = (address, state) => {
  if (!address) return
  try {
    const serialized = JSON.stringify({ swap: state })
    localStorageSet(address, serialized)
  } catch (err) {
    console.error(err)
  }
}

export const clearSwap = (address) => {
  if (!address) return

  localStorageSet(address, JSON.stringify({ swap: [] }))
}

export const restoreWallet = () => {
  const query = queryString.parse(window.location.search)
  let wallet
  if (query.wallet) {
    const encryptedWalletString = Buffer.from(query.wallet, 'base64').toString()
    const encryptedWallet = parseEncryptedWalletString(encryptedWalletString)
    if (encryptedWallet) {
      wallet = JSON.stringify({
        type: 'keystore',
        address: toChecksumAddress(encryptedWallet.address),
        data: encryptedWallet
      })
      sessionStorageSet('wallet', wallet)
    }
  } else {
    wallet = parseWalletString(sessionStorageGet('wallet'))
  }
  if (!wallet) return undefined

  return wallet
}

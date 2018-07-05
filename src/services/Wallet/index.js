export * from './lib'

import queryString from 'query-string'
import log from 'Utilities/log'
import blockstack from 'Utilities/blockstack'
import { sessionStorageGet, sessionStorageSet, sessionStorageRemove, sessionStorageForEach } from 'Utilities/storage'
import { Wallet, WalletSerializer, MultiWallet } from './lib'


const legacyStorageKey = 'wallet'
const walletStorageKeyPrefix = 'faast-wallet-'
const multiWalletStorageKeyPrefix = 'faast-multiwallet-' // Deprecated

const walletStorageKey = (id) => `${walletStorageKeyPrefix}${id}`

const getStorageKey = (wallet) => walletStorageKey(wallet.getId())

const defaultWalletService = new WalletService()

window.faast = window.faast || {}
window.faast.wallets = defaultWalletService._activeWallets

export default defaultWalletService

export function WalletService() {
  
  const activeWallets = {}
  let walletAssetProvider = () => {}

  const setAssetProvider = (assetProvider) => {
    walletAssetProvider = assetProvider
    Object.values(activeWallets).forEach((wallet) => wallet.setAssetProvider(assetProvider))
  }

  const getStoredWalletKeys = () => {
    const walletKeys = []
    const multiWalletKeys = []
    sessionStorageForEach((key) => {
      if (key.startsWith(walletStorageKeyPrefix)) {
        walletKeys.push(key)
      } else if (key.startsWith(multiWalletStorageKeyPrefix)) {
        multiWalletKeys.push(key)
      }
    })
    // Migrate deprecated multiwallet keys
    multiWalletKeys.forEach((key) => {
      const newKey = key.replace(multiWalletStorageKeyPrefix, walletStorageKeyPrefix)
      const data = sessionStorageGet(key)
      sessionStorageRemove(key)
      sessionStorageSet(newKey, data)
      walletKeys.push(newKey)
    })
    return walletKeys
  }

  const put = (wallet) => {
    if (wallet) {
      wallet.setAssetProvider(walletAssetProvider)
      wallet.setWalletGetter(get)
      activeWallets[wallet.getId()] = wallet
    }
    return wallet
  }

  /** Get all wallets as array */
  const getAll = () => Object.values(activeWallets)

  /** Get all wallets as an object mapped by ID */
  const getAllById = () => ({ ...activeWallets })

  /** Get a Wallet by ID. Returns if already a Wallet */
  const get = (walletOrId) => {
    if (walletOrId instanceof Wallet) {
      return walletOrId
    }
    const id = walletOrId
    let wallet = activeWallets[id]
    return wallet
  }

  /** Remove the provided Wallet or Wallet with specified ID and delete from session */
  const remove = (walletOrId) => {
    let id = walletOrId
    if (walletOrId instanceof Wallet) {
      id = walletOrId.getId()
    }
    const removedWallet = activeWallets[id]
    if (removedWallet) {
      delete activeWallets[id]
      log.debug('removed wallet', id)
      deleteFromStorage(removedWallet)
    }
    return removedWallet
  }

  /** Removes all Wallets and clears any stored in the session */
  const removeAll = () => {
    Object.keys(activeWallets).map(remove)
    getStoredWalletKeys().forEach(sessionStorageRemove)
  }

  /** Load the wallet from session at the provided storage key */
  const loadFromStorage = (storageKey) => {
    const walletString = sessionStorageGet(storageKey)
    if (walletString) {
      const wallet = WalletSerializer.parse(walletString)
      if (wallet) {
        log.debug('wallet loaded from session', wallet.getId())
      } else {
        log.debug('failed to load wallet from session key', storageKey)
      }
      return wallet
    }
  }

  /** Save the provided wallet to session storage */
  const saveToStorage = (wallet) => {
    if (wallet && wallet.isPersistAllowed()) {
      const id = wallet.getId()
      const storageKey = getStorageKey(wallet)
      sessionStorageSet(storageKey, WalletSerializer.stringify(wallet))
      log.debug('wallet saved to session', id)
    }
    return wallet
  }

  const deleteFromStorage = (wallet) => {
    if (wallet) {
      const id = wallet.getId()
      const key = getStorageKey(wallet)
      if (sessionStorageGet(key)) {
        sessionStorageRemove(key)
        log.debug('wallet deleted from session', id)
      }
    }
    return wallet
  }

  /** Restore all wallets stored in session */
  const restoreSessionStorage = () => getStoredWalletKeys().map((key) => {
    const wallet = loadFromStorage(key)
    if (wallet) {
      const newStorageKey = getStorageKey(wallet)
      if (key !== newStorageKey) {
        sessionStorageRemove(key)
        saveToStorage(wallet)
        log.debug(`migrated wallet from session key ${key} to ${newStorageKey}`)
      }
      put(wallet)
    }
  })

  /** Convert legacy wallet to new storage format, store in the new format and return the wallet */
  const restoreLegacy = () => {
    const legacyWallet = loadFromStorage(legacyStorageKey)
    if (legacyWallet) {
      log.debug('restored legacy wallet', legacyWallet.getId())
      saveToStorage(legacyWallet)
      put(legacyWallet)
    }
    sessionStorageRemove(legacyStorageKey)
    return legacyWallet
  }

  /** Parse the wallet from url query string and store in session */
  const restoreQueryString = () => {
    const query = queryString.parse(window.location.search)
    if (query.wallet) {
      const encryptedWalletString = Buffer.from(query.wallet, 'base64').toString()
      const wallet = WalletSerializer.parse(encryptedWalletString)
      if (wallet) {
        log.debug('restored querystring wallet', wallet.getId())
        saveToStorage(wallet)
        put(wallet)
        return wallet
      }
    }
  }

  const restoreBlockstack = () => {
    const wallet = blockstack.restoreWallet()
    if (wallet) {
      log.debug('restored blockstack wallet', wallet.getId())
      put(wallet)
      return wallet
    }
  }

  const add = (wallet) => {
    if (wallet instanceof Wallet) {
      const id = wallet.getId()
      if (!activeWallets.hasOwnProperty(id)) {
        log.debug('adding new wallet', id)
      }
      put(wallet)
      saveToStorage(wallet)
    } else {
      log.error('not a wallet', wallet)
    }
    return wallet
  }

  const update = add

  const restoreAll = () => {
    restoreSessionStorage()
    restoreLegacy()
    restoreQueryString()
    restoreBlockstack()
    // Filter invalid wallet references
    const activeWalletIds = new Set(Object.keys(activeWallets))
    const activeWalletsList = Object.values(activeWallets)
    activeWalletsList.forEach((wallet) => {
      if (wallet instanceof MultiWallet) {
        wallet.walletIds = new Set(Array.from(wallet.walletIds).filter((walletId) => activeWalletIds.has(walletId)))
      }
    })
    log.debug('wallets restored', activeWalletsList)
    return activeWalletsList
  }

  return {
    _activeWallets: activeWallets,
    setAssetProvider,
    get,
    getAll,
    getAllById,
    remove,
    removeAll,
    add,
    update,
    restoreAll
  }
}

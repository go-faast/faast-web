export * from './lib'

import queryString from 'query-string'
import log from 'Utilities/log'
import blockstack from 'Utilities/blockstack'
import { sessionStorageGet, sessionStorageSet, sessionStorageRemove, sessionStorageForEach } from 'Utilities/storage'
import { Wallet, WalletSerializer, MultiWallet } from './lib'


const legacyStorageKey = 'wallet'
const storageKeyPrefix = 'faast-wallet-'
const storageKey = (id) => `${storageKeyPrefix}${id}`

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
    const keys = []
    sessionStorageForEach((key) => {
      if (key.startsWith(storageKeyPrefix)) {
        keys.push(key)
      }
    })
    return keys
  }

  const put = (wallet) => {
    if (wallet) {
      wallet.setAssetProvider(walletAssetProvider)
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
    let wallet = activeWallets[walletOrId]
    if (wallet) {
      return wallet
    }
    wallet = loadFromStorage(walletOrId)
    if (wallet) {
      put(wallet)
    } else {
      log.debug('could not get wallet', walletOrId)
    }
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
      Object.values(activeWallets).forEach((activeWallet) => {
        if (activeWallet instanceof MultiWallet && activeWallet.removeWallet(removedWallet)) {
          log.debug(`removed wallet ${id} from MultiWallet ${activeWallet.getId()}`)
          saveToStorage(activeWallet)
        }
      })
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
      sessionStorageSet(storageKey(id), WalletSerializer.stringify(wallet))
      log.debug('wallet saved to session', id)
    }
    return wallet
  }

  const deleteFromStorage = (wallet) => {
    if (wallet) {
      const id = wallet.getId()
      const key = storageKey(id)
      if (sessionStorageGet(key)) {
        sessionStorageRemove(key)
        log.debug('wallet deleted from session', id)
      }
    }
    return wallet
  }

  /** Restore all wallets stored in session */
  const restoreSessionStorage = () => getStoredWalletKeys().map(loadFromStorage)

  /** Convert legacy wallet to new storage format, store in the new format and return the wallet */
  const restoreLegacy = () => {
    const legacyWallet = loadFromStorage(legacyStorageKey)
    if (legacyWallet) {
      log.debug('restored legacy wallet', legacyWallet.getId())
      saveToStorage(legacyWallet)
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
        return wallet
      }
    }
  }

  const restoreBlockstack = () => {
    const wallet = blockstack.restoreWallet()
    if (wallet) {
      log.debug('restored blockstack wallet', wallet.getId())
      return wallet
    }
  }

  const add = (wallet) => {
    if (wallet instanceof Wallet) {
      const id = wallet.getId()
      if (wallet.isEncrypted === false || (wallet.wallets && wallet.wallets.some((w) => w.isEncrypted === false))) {
        // Need to explicitly compare with false because isEncrypted === undefined -> encryption not applicable
        throw new Error(`Cannot add unencrypted wallet ${id}`)
      }
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

  const restoreAll = () => {
    const restoredWallets = [
      restoreSessionStorage(),
      restoreLegacy(),
      restoreQueryString(),
      restoreBlockstack()
    ]
    restoredWallets.reduce((flattened, wallet) => [...flattened, ...(Array.isArray(wallet) ? wallet : [wallet])], [])
      .filter((wallet) => wallet instanceof Wallet)
      .forEach(put)
    log.debug('wallets restored', Object.keys(activeWallets))
    return Object.values(activeWallets)
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
    restoreAll
  }
}
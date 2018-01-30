export * from './lib'

import queryString from 'query-string'
import log from 'Utilities/log'
import blockstack from 'Utilities/blockstack'
import { sessionStorageGet, sessionStorageSet, sessionStorageRemove, sessionStorageForEach } from 'Utilities/storage'
import { Wallet, WalletSerializer } from './lib'


const legacyStorageKey = 'wallet'
const storageKeyPrefix = 'faast-wallet-'
const storageKey = (id) => `${storageKeyPrefix}${id}`

const defaultWalletService = new WalletService()

window.faast = window.faast || {}
window.faast.wallets = defaultWalletService._activeWallets

export default defaultWalletService

export function WalletService() {
  
  const activeWallets = {}

  const getStoredWalletKeys = () => {
    const keys = []
    sessionStorageForEach((key) => {
      if (key.startsWith(storageKeyPrefix)) {
        keys.push(key)
      }
    })
    return keys
  }

  /** Get all wallets as an object mapped by ID */
  const getAll = () => ({ ...activeWallets })

  /** Get a Wallet by ID. Returns arg if already a Wallet */
  const get = (walletOrId) => {
    if (walletOrId instanceof Wallet) {
      return walletOrId
    }
    return activeWallets[walletOrId]
  }

  /** Remove the provided Wallet or Wallet with specified ID and delete from session */
  const remove = (walletOrId) => {
    let id = walletOrId
    if (walletOrId instanceof Wallet) {
      id = walletOrId.getId()
    }
    const removedWallet = activeWallets[id]
    delete activeWallets[id]
    sessionStorageRemove(storageKey(id))
    log.debug('removed wallet', id)
    return removedWallet
  }

  /** Removes all Wallets and clears any stored in the session */
  const removeAll = () => {
    Object.keys(activeWallets).map(remove)
    getStoredWalletKeys().forEach(sessionStorageRemove)
  }

  const parse = WalletSerializer.parse

  /** Load the wallet from session at the provided storage key */
  const load = (storageKey) => {
    const walletString = sessionStorageGet(storageKey)
    if (walletString) {
      const wallet = parse(walletString)
      if (wallet) {
        log.debug('loaded wallet', wallet.getId())
      } else {
        log.debug('failed to load wallet from session key', storageKey)
      }
      return wallet
    }
  }

  /** Save the provided wallet to session storage */
  const persist = (wallet) => {
    if (wallet && !wallet.dontPersist) {
      const id = wallet.getId()
      sessionStorageSet(storageKey(id), WalletSerializer.stringify(wallet))
      log.debug('wallet saved to session', id)
    }
    return wallet
  }

  const put = (wallet) => {
    if (wallet) {
      activeWallets[wallet.getId()] = wallet
    }
    return wallet
  }

  /** Restore all wallets stored in session */
  const restoreSessionStorage = () => getStoredWalletKeys().map(load)

  /** Convert legacy wallet to new storage format, store in the new format and return the wallet */
  const restoreLegacy = () => {
    const legacyWallet = load(legacyStorageKey)
    if (legacyWallet) {
      log.debug('converted legacy wallet', legacyWallet.getId())
      persist(legacyWallet)
    }
    sessionStorageRemove(legacyStorageKey)
    return legacyWallet
  }

  /** Parse the wallet from url query string and store in session */
  const restoreQueryString = () => {
    const query = queryString.parse(window.location.search)
    if (query.wallet) {
      const encryptedWalletString = Buffer.from(query.wallet, 'base64').toString()
      return persist(parse(encryptedWalletString))
    }
  }

  const restoreBlockstack = () => {
    if (blockstack.isUserSignedIn()) {
      const wallet = blockstack.createWallet()
      wallet.dontPersist = true
      return wallet
    }
  }

  const save = (wallet) => {
    if (wallet instanceof Wallet) {
      const id = wallet.getId()
      if (wallet.isEncrypted === false || (wallet.wallets && wallet.wallets.some((w) => w.isEncrypted === false))) {
        // Need to explicitly compare with false because isEncrypted === undefined -> encryption not applicable
        throw new Error(`Cannot save unencrypted wallet ${id}`)
      }
      if (!activeWallets.hasOwnProperty(id)) {
        log.debug('adding new wallet', id)
      }
      put(wallet)
      persist(wallet)
    } else {
      log.error('not a wallet', wallet)
    }
    return wallet
  }

  const saveAll = () => {
    Object.values(activeWallets).forEach(save)
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
    getAll,
    get,
    remove,
    removeAll,
    save,
    saveAll,
    restoreAll
  }
}
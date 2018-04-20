import { createAction } from 'redux-act'
import sha256 from 'hash.js/lib/hash/sha/256'

import blockstack from 'Utilities/blockstack'
import log from 'Utilities/log'
import walletService, { Wallet, MultiWallet, BlockstackWallet } from 'Services/Wallet'
import { getAllAssets, getWalletParents } from 'Selectors'
import { getWalletIconProps } from 'Utilities/walletIcon'

const convertWalletInstance = (wallet) => wallet instanceof Wallet ? ({
  id: wallet.getId(),
  hashId: sha256().update(wallet.getId()).digest('hex').slice(0, 10),
  label: wallet.getLabel(),
  type: wallet.getType(),
  typeLabel: wallet.getTypeLabel(),
  address: wallet.isSingleAddress() ? wallet.getAddress() : '',
  iconProps: getWalletIconProps(wallet),
  isBlockstack: wallet.getType() === BlockstackWallet.type,
  isReadOnly: wallet.isReadOnly(),
  isSignTxSupported: wallet.isSignTransactionSupported(),
  supportedAssets: wallet.getSupportedAssetSymbols(),
  nestedWalletIds: wallet.getType() === MultiWallet.type ? wallet.wallets.map((w) => w.getId()) : [],
}) : wallet

export const walletAdded = createAction('WALLET_ADDED', convertWalletInstance)
export const walletUpdated = createAction('WALLET_UPDATED', convertWalletInstance)
export const walletRemoved = createAction('WALLET_REMOVED', convertWalletInstance)

export const allWalletsUpdated = createAction('ALL_WALLETS_UPDATED', (...walletInstances) => walletInstances.map(convertWalletInstance))
export const allWalletsRemoved = createAction('ALL_WALLETS_REMOVED')

export const walletBalancesUpdating = createAction('WALLET_BALANCES_UPDATING', (walletId) => ({ id: walletId }))
export const walletBalancesUpdated = createAction('WALLET_BALANCES_UPDATED', (walletId, balancesByAsset) => ({
  id: walletId,
  balances: balancesByAsset
}))
export const walletBalancesError = createAction('WALLET_BALANCES_ERROR', (walletId, error) => ({
  id: walletId,
  error: error.message || error,
}))

export const addWallet = (walletInstance) => (dispatch) => Promise.resolve()
  .then(() => walletService.add(walletInstance))
  .then(() => dispatch(walletAdded(walletInstance)).payload)

export const updateWallet = (id) => (dispatch) => Promise.resolve()
  .then(() => walletService.get(id))
  .then((walletInstance) => {
    walletService.update(walletInstance)
    return dispatch(walletUpdated(walletInstance)).payload
  })

export const removeWallet = (id) => (dispatch, getState) => Promise.resolve()
  .then(() => walletService.remove(id))
  .then((walletInstance) => {
    const wallet = convertWalletInstance(walletInstance) || { id }
    const parents = getWalletParents(getState(), id)
    return Promise.all(parents.map((parent) => dispatch(updateWallet(parent.id))))
      .then(() => {
        dispatch(walletRemoved(wallet))
        if (wallet.type === BlockstackWallet.type) {
          blockstack.signUserOut()
        }
        return wallet
      })
  })

export const removeAllWallets = () => (dispatch) => Promise.resolve()
  .then(() => walletService.removeAll())
  .then(() => dispatch(allWalletsRemoved()))

export const restoreAllWallets = () => (dispatch, getState) => Promise.resolve()
  .then(() => walletService.setAssetProvider(() => getAllAssets(getState())))
  .then(() => walletService.restoreAll())
  .then((walletInstances) => walletInstances.map((w) => dispatch(walletAdded(w)).payload))

export const updateWalletBalances = (walletId) => (dispatch) => Promise.resolve()
  .then(() => {
    const walletInstance = walletService.get(walletId)
    if (!walletInstance) {
      throw new Error(`Could not find wallet with id ${walletId}`)
    }
    if (walletInstance.getType() === MultiWallet.type) {
      return Promise.all(walletInstance.wallets.map((nested) => dispatch(updateWalletBalances(nested.getId()))))
    }
    dispatch(walletBalancesUpdating(walletId))
    return walletInstance.getAllBalances()
  })
  .then((symbolToBalance) => {
    dispatch(walletBalancesUpdated(walletId, symbolToBalance))
    return symbolToBalance
  })
  .catch((e) => {
    log.error(`Failed to update balances for wallet ${walletId}:`, e)
    let message = e.message || e
    if (typeof message !== 'string') { 
      message = 'Unknown error occured while updating wallet balances'
    }
    if (message.includes('Failed to fetch')) {
      message = 'Error loading wallet balances'
    }
    dispatch(walletBalancesError(walletId, message))
    return {}
  })

const doForNestedWallets = (cb) => (multiWalletId, ...nestedWalletIds) => (dispatch) =>
  Promise.all([
    walletService.get(multiWalletId),
    ...nestedWalletIds.map((nestedWalletId) => walletService.get(nestedWalletId)),
  ]).then(([multiWallet, ...nestedWallets]) => {
    if (multiWallet.getType() !== MultiWallet.type) {
      throw new Error(`Wallet ${multiWalletId} is not a ${MultiWallet.type}`)
    }
    return Promise.all(nestedWallets.map((nestedWallet) => Promise.resolve(cb(multiWallet, nestedWallet))))
      .then(() => dispatch(updateWallet(multiWalletId)))
  })

export const addNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.addWallet(nestedWallet))
export const addNestedWallet = addNestedWallets
export const removeNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.removeWallet(nestedWallet))
export const removeNestedWallet = removeNestedWallets

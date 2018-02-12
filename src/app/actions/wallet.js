import { createAction } from 'redux-act'

import log from 'Utilities/log'
import walletService, { Wallet, MultiWallet } from 'Services/Wallet'
import { getAllAssets, getWalletParents } from 'Selectors'

const convertWalletInstance = (wallet) => wallet instanceof Wallet ? ({
  id: wallet.getId(),
  type: wallet.type,
  address: wallet.isSingleAddress() ? wallet.getAddress() : '',
  isBlockstack: wallet.isBlockstack,
  isReadOnly: wallet.isReadOnly,
  supportedAssets: wallet.getSupportedAssetSymbols(),
  nestedWalletIds: wallet.type === 'MultiWallet' ? wallet.wallets.map((w) => w.getId()) : [],
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
  .then((walletInstance) => dispatch(walletUpdated(walletInstance)).payload)

export const removeWallet = (id) => (dispatch, getState) => Promise.resolve()
  .then(() => walletService.remove(id))
  .then((walletInstance) => {
    const wallet = convertWalletInstance(walletInstance) || { id }
    const parents = getWalletParents(getState(), id)
    dispatch(walletRemoved(wallet))
    return Promise.all(parents.map((parent) => dispatch(updateWallet(parent.id))))
      .then(() => wallet)
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
    const wallet = walletService.get(walletId)
    if (!wallet) {
      log.error('no wallet with id', walletId)
      throw new Error('failed to load balances')
    }
    dispatch(walletBalancesUpdating(walletId))
    return wallet.getAllBalances()
  })
  .then((symbolToBalance) => {
    dispatch(walletBalancesUpdated(walletId, symbolToBalance))
    return symbolToBalance
  })
  .catch((e) => {
    dispatch(walletBalancesError(walletId, e))
    return {}
  })

const doForNestedWallets = (cb) => (multiWalletId, ...nestedWalletIds) => (dispatch) =>
  Promise.all([
    walletService.get(multiWalletId),
    ...nestedWalletIds.map((nestedWalletId) => walletService.get(nestedWalletId)),
  ]).then(([multiWallet, ...nestedWallets]) => {
    if (multiWallet.type !== MultiWallet.type) {
      throw new Error(`Wallet ${multiWalletId} is not a ${MultiWallet.type}`)
    }
    return Promise.all(nestedWallets.map((nestedWallet) => Promise.resolve(cb(multiWallet, nestedWallet))))
      .then(() => dispatch(walletUpdated(multiWallet)))
      .then(() => updateWalletBalances(multiWalletId))
  })

export const addNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.addWallet(nestedWallet))
export const addNestedWallet = addNestedWallets
export const removeNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.removeWallet(nestedWallet))
export const removeNestedWallet = removeNestedWallets

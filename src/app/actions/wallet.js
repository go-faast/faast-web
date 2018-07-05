import { newScopedCreateAction } from 'Utilities/action'
import blockstack from 'Utilities/blockstack'
import log from 'Utilities/log'
import walletService, { Wallet, MultiWallet, EthereumWalletBlockstack } from 'Services/Wallet'
import { getAllAssets, getWalletParents, areWalletBalancesUpdating } from 'Selectors'
import { getWalletIconProps } from 'Utilities/walletIcon'

const createAction = newScopedCreateAction(__filename)

const convertWalletInstance = (wallet) => wallet instanceof Wallet ? ({
  id: wallet.getId(),
  label: wallet.getLabel(),
  type: wallet.getType(),
  typeLabel: wallet.getTypeLabel(),
  address: wallet.isSingleAddress() ? wallet.getAddress() : '',
  iconProps: getWalletIconProps(wallet),
  isBlockstack: wallet instanceof EthereumWalletBlockstack,
  isReadOnly: wallet.isReadOnly(),
  isSignTxSupported: wallet.isSignTransactionSupported(),
  supportedAssets: wallet.getSupportedAssetSymbols(),
  unsendableAssets: wallet.getUnsendableAssetSymbols(),
  nestedWalletIds: wallet instanceof MultiWallet ? wallet.getWalletIds() : [],
}) : wallet

export const walletAdded = createAction('ADDED', convertWalletInstance)
export const walletUpdated = createAction('UPDATED', convertWalletInstance)
export const walletRemoved = createAction('REMOVED', (id) => ({ id }))

export const allWalletsUpdated = createAction('ALL_UPDATED', (...walletInstances) => walletInstances.map(convertWalletInstance))
export const allWalletsRemoved = createAction('ALL_REMOVED')

export const walletBalancesUpdating = createAction('BALANCES_UPDATING', (walletId) => ({ id: walletId }))
export const walletBalancesUpdated = createAction('BALANCES_UPDATED', (walletId, balancesByAsset) => ({
  id: walletId,
  balances: balancesByAsset
}))
export const walletBalancesError = createAction('BALANCES_ERROR', (walletId, error) => ({
  id: walletId,
  error: error.message || error,
}))

export const addWallet = (walletInstance) => (dispatch) => Promise.resolve()
  .then(() => walletService.add(walletInstance))
  .then(() => dispatch(walletAdded(walletInstance)).payload)

export const updateWallet = (id) => (dispatch) => Promise.resolve()
  .then(() => walletService.get(id))
  .then((walletInstance) => {
    if (!walletInstance) {
      return
    }
    walletService.update(walletInstance)
    return dispatch(walletUpdated(walletInstance)).payload
  })

export const removeWallet = (id) => (dispatch, getState) => Promise.resolve()
  .then(() => walletService.remove(id))
  .then((walletInstance) => {
    if (!walletInstance) {
      return
    }
    if (walletInstance instanceof EthereumWalletBlockstack) {
      blockstack.signUserOut()
    } else if (walletInstance instanceof MultiWallet) {
      return Promise.all(walletInstance.getWalletIds().map((nestedId) => dispatch(removeWallet(nestedId))))
        .then(() => walletInstance)
    }
  })
  .then((walletInstance) => {
    const parents = getWalletParents(getState(), id)
    return Promise.all(parents.map((parent) => dispatch(removeNestedWallet(parent.id, id))))
      .then(() => {
        dispatch(walletRemoved(id))
        return convertWalletInstance(walletInstance)
      })
  })

export const removeAllWallets = () => (dispatch) => Promise.resolve()
  .then(() => walletService.removeAll())
  .then(() => dispatch(allWalletsRemoved()))

export const restoreAllWallets = () => (dispatch, getState) => Promise.resolve()
  .then(() => walletService.setAssetProvider(() => getAllAssets(getState())))
  .then(() => walletService.restoreAll())
  .then((walletInstances) => walletInstances.map((w) => dispatch(walletAdded(w)).payload))

export const updateWalletBalances = (walletId) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    if (areWalletBalancesUpdating(getState(), walletId)) {
      return
    }
    const walletInstance = walletService.get(walletId)
    if (!walletInstance) {
      throw new Error(`Could not find wallet with id ${walletId}`)
    }
    if (walletInstance instanceof MultiWallet) {
      return Promise.all(walletInstance.getWalletIds().map((nestedId) => dispatch(updateWalletBalances(nestedId))))
    }
    dispatch(walletBalancesUpdating(walletId))
    return walletInstance.getAllBalances()
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
  })

const doForNestedWallets = (cb) => (multiWalletId, ...nestedWalletIds) => (dispatch) =>
  Promise.all([
    walletService.get(multiWalletId),
    ...nestedWalletIds.map((nestedWalletId) => walletService.get(nestedWalletId)),
  ]).then(([multiWallet, ...nestedWallets]) => {
    if (!(multiWallet instanceof MultiWallet)) {
      throw new Error(`Wallet ${multiWalletId} is not a ${MultiWallet.type}`)
    }
    return Promise.all(nestedWallets.map((nestedWallet) => nestedWallet && cb(multiWallet, nestedWallet)))
      .then(() => dispatch(updateWallet(multiWalletId)))
  })

export const addNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.addWallet(nestedWallet))
export const addNestedWallet = addNestedWallets
export const removeNestedWallets = doForNestedWallets((multiWallet, nestedWallet) => multiWallet.removeWallet(nestedWallet))
export const removeNestedWallet = removeNestedWallets

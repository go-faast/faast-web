import { newScopedCreateAction } from 'Utilities/action'
import blockstack from 'Utilities/blockstack'
import log from 'Utilities/log'
import walletService, { Wallet, MultiWallet, EthereumWalletBlockstack } from 'Services/Wallet'
import { getAllAssets, getWalletParents, areWalletBalancesUpdating, getWalletBalances, areWalletBalancesLoaded } from 'Selectors'
import { getWalletIconProps } from 'Utilities/walletIcon'
import { retry } from 'Utilities/helpers'

const createAction = newScopedCreateAction(__filename)

const convertWalletInstance = (wallet) => wallet instanceof Wallet ? ({
  id: wallet.getId(),
  label: wallet.getLabel(),
  type: wallet.getType(),
  typeLabel: wallet.getTypeLabel(),
  ...(wallet.isSingleAddress() ? ({
    address: wallet.getAddress(),
    usedAddresses: [wallet.getAddress()],
  }) : ({
    address: '',
    usedAddresses: []
  })),
  iconProps: getWalletIconProps(wallet),
  isBlockstack: wallet instanceof EthereumWalletBlockstack,
  isReadOnly: wallet.isReadOnly(),
  isSignTxSupported: wallet.isSignTransactionSupported(),
  supportedAssets: wallet.getSupportedAssetSymbols(),
  unsendableAssets: wallet.getUnsendableAssetSymbols(),
  nestedWalletIds: wallet instanceof MultiWallet ? wallet.getWalletIds() : [],
  ordersAllLoaded: wallet instanceof MultiWallet // Orders can't be loaded for multiwallets
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
export const walletBalancesLoaded = createAction('BALANCES_LOADED', (walletId, balances) => ({
  id: walletId,
  balances
}))
export const walletBalancesError = createAction('BALANCES_ERROR', (walletId, error) => ({
  id: walletId,
  error: error.message || error,
}))

export const walletUsedAddressesUpdated = createAction('USED_ADDRESSES_UPDATED', (id, usedAddresses) => ({ id, usedAddresses }))

export const walletOrdersAllLoaded = createAction('ALL_ORDERS_LOADED', (walletId) => ({ walletId }))
export const walletOrdersLoading = createAction('ORDERS_LOADING', (walletId) => ({ walletId }))
export const walletOrdersLoaded = createAction('ORDERS_LOADED', (walletId) => ({ walletId }))

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

/** Remove all wallets that would be orphaned if walletInstance were removed */
const removeWalletOrphans = (walletInstance) => (dispatch, getState) => {
  const id = walletInstance.getId()
  log.debug('removeWalletOrphans', id)
  if (walletInstance instanceof MultiWallet) {
    return Promise.all(walletInstance.getWalletIds().map((nestedId) => {
      const parents = getWalletParents(getState(), nestedId)
      log.debug('removeWalletOrphans parents', nestedId, parents)
      const otherParents = parents.filter((parent) => parent.id !== id)
      if (otherParents.length === 0) {
        return dispatch(removeWallet(nestedId))
      }
    }))
  }
  return Promise.resolve()
}

/** Remove walletId from all parent MultiWallets */
const disownWallet = (walletId) => (dispatch, getState) => {
  log.debug('disownWallet', walletId)
  const parents = getWalletParents(getState(), walletId)
  log.debug('disownWallet parents', parents)
  return Promise.all(parents.map((parent) => dispatch(removeNestedWallet(parent.id, walletId))))
}

export const removeWallet = (id) => (dispatch) => Promise.resolve()
  .then(() => {
    log.debug('removeWallet', id)
    return walletService.get(id)
  })
  .then((walletInstance) => {
    if (!walletInstance) {
      return
    }
    if (walletInstance instanceof EthereumWalletBlockstack) {
      blockstack.signUserOut()
    }
    return Promise.all([
      dispatch(removeWalletOrphans(walletInstance)),
      dispatch(disownWallet(id))
    ]).then(() => {
      walletService.remove(id)
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

const getManyBalances = (walletInstance, walletId) => {
  const top10SupportedAssets = walletInstance.getTop10SupportedAssets()
  return retry(() => walletInstance.getManyBalances(top10SupportedAssets), {
    retries: 5,
    before: (attempts, delay, e) => log.debug(
      `Failed balance request for wallet ${walletId}. ` +
          `Waiting ${delay}ms then retrying ${attempts} more times. ` +
          `Caused by error: ${e.message}`)
  })
}
  
const getAllBalances = (walletInstance, walletId) => {
  return retry(() => walletInstance.getAllBalances(), {
    retries: 5,
    before: (attempts, delay, e) => log.debug(
      `Failed balance request for wallet ${walletId}. ` +
          `Waiting ${delay}ms then retrying ${attempts} more times. ` +
          `Caused by error: ${e.message}`)
  })
}

export const updateWalletBalances = (walletId) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    const walletInstance = walletService.get(walletId)
    if (!walletInstance) {
      dispatch(disownWallet(walletId))
      dispatch(walletRemoved(walletId))
      throw new Error(`Could not find wallet with id ${walletId}`)
    }
    if (walletInstance instanceof MultiWallet) {
      return Promise.all(walletInstance.getWalletIds().map((nestedId) => dispatch(updateWalletBalances(nestedId))))
    }
    if (areWalletBalancesUpdating(getState(), walletId)) {
      log.debug(`Wallet balances already updating ${walletId}`)
      return getWalletBalances(getState(), walletId)
    }
    dispatch(walletBalancesUpdating(walletId))
    console.log('wallet balances updating', walletId)

    const walletLoaded = areWalletBalancesLoaded(getState(), walletId)
    const balanceFunction = walletLoaded ? getAllBalances : getManyBalances

    return balanceFunction(walletInstance, walletId)
      .then((symbolToBalance) => {
        console.log('wallet balances loaded', walletId, symbolToBalance)
        dispatch(walletBalancesLoaded(walletId, symbolToBalance))
        areWalletBalancesLoaded(getState(), walletId)
        !walletLoaded ? (
          getAllBalances(walletInstance, walletId)
            .then((symbolToBalance) =>  {
              console.log('wallet balances updated', walletId, symbolToBalance)
              return dispatch(walletBalancesUpdated(walletId, symbolToBalance))
            })
        ) : dispatch(walletBalancesUpdated(walletId, symbolToBalance))
        // Retrieve used addresses in background
        walletInstance.getUsedAddresses()
          .then((usedAddresses) => dispatch(walletUsedAddressesUpdated(walletId, usedAddresses)))
          .catch((e) => log.error(`Wallet ${walletId} failed to load used addreses`, e))

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
        return getWalletBalances(getState(), walletId)
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

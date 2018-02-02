import { createAction } from 'redux-act'

import log from 'Utilities/log'
import walletService from 'Services/Wallet'

export const walletAdded = createAction('WALLET_ADDED', (wallet) => ({
  id: wallet.getId(),
  type: wallet.type,
  address: wallet.getAddress ? wallet.getAddress() : null,
  isBlockstack: wallet.isBlockstack,
  supportedAssets: wallet.getSupportedAssetSymbols(),
}))
export const walletRemoved = createAction('WALLET_REMOVED')
export const allWalletsRemoved = createAction('ALL_WALLETS_REMOVED')

export const walletBalancesUpdated = createAction('WALLET_BALANCES_UPDATED', (walletId, balancesByAsset) => ({
  id: walletId,
  balances: balancesByAsset
}))

export const addWallet = (wallet) => (dispatch) => Promise.resolve()
  .then(() => walletService.add(wallet))
  .then(() => dispatch(walletAdded(wallet)))
  .then(({ payload }) => payload)

export const removeWallet = (walletId) => (dispatch) => Promise.resolve()
  .then(() => walletService.remove(walletId))
  .then(() => dispatch(walletRemoved({ id: walletId })))

export const removeAllWallets = () => (dispatch) => Promise.resolve()
  .then(() => walletService.removeAll())
  .then(() => dispatch(allWalletsRemoved()))

export const restoreAllWallets = () => (dispatch) => Promise.resolve()
  .then(() => walletService.restoreAll())
  .then((restoredWallets) => restoredWallets.map((w) => dispatch(walletAdded(w)).payload))

export const updateWalletBalances = (walletId, assets) => (dispatch) => Promise.resolve()
  .then(() => {
    const wallet = walletService.get(walletId)
    if (!wallet) {
      log.error('no wallet with id', walletId)
      throw new Error('failed to load balances')
    }
    wallet.setAllAssets(assets)
    return wallet.getAllBalances()
  })
  .then((symbolToBalance) => {
    dispatch(walletBalancesUpdated(walletId, symbolToBalance))
    return symbolToBalance
  })
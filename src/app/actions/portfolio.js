import { flatten, difference } from 'lodash'

import { newScopedCreateAction } from 'Utilities/action'
import log from 'Utilities/log'
import { MultiWallet } from 'Services/Wallet'
import config from 'Config'

import {
  addWallet, removeWallet, restoreAllWallets, updateWalletBalances, addNestedWallets
} from 'Actions/wallet'
import { retrieveAssetPrices } from 'Actions/asset'
import { getDefaultPortfolio } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

const { defaultPortfolioId } = config

export { defaultPortfolioId }

export const setCurrentPortfolio = createAction('SET_CURRENT_PORTFOLIO', (portfolioId) => ({ portfolioId }))
export const setCurrentWallet = createAction('SET_CURRENT_WALLET', (portfolioId, walletId) => ({ portfolioId, walletId }))
export const portfolioAdded = createAction('PORTFOLIO_ADDED')

export const removePortfolio = (id) => (dispatch) => Promise.resolve()
  .then(() => {
    if (id === defaultPortfolioId) {
      throw new Error('Cannot delete default portfolio');
    }
    return dispatch(removeWallet(id))
  })

export const addPortfolio = (walletInstance, setCurrent = false) => (dispatch) => Promise.resolve()
  .then(() => dispatch(addWallet(walletInstance)))
  .then((wallet) => {
    dispatch(portfolioAdded(wallet.id))
    if (setCurrent) {
      dispatch(setCurrentPortfolio(wallet.id))
    }
    return wallet
  })

export const createNewPortfolio = (setCurrent = false) => (dispatch) => Promise.resolve()
  .then(() => dispatch(addPortfolio(new MultiWallet(), setCurrent)))

const createDefaultPortfolio = () => (dispatch, getState) => Promise.resolve()
  .then(() => {
    const defaultPortfolio = getDefaultPortfolio(getState())
    if (!defaultPortfolio) {
      const wallet = new MultiWallet(defaultPortfolioId)
      wallet.setLabel('My Portfolio')
      return dispatch(addPortfolio(wallet, false))
    }
  })

const getReachableWalletIds = (walletsById, startingWalletIds = []) => {
  return flatten(startingWalletIds.map((startingId) => {
    const wallet = walletsById[startingId]
    if (!wallet) {
      return []
    }
    return [wallet.id, ...getReachableWalletIds(walletsById, wallet.nestedWalletIds)]
  }))
}

export const restoreAllPortfolios = () => (dispatch) => dispatch(restoreAllWallets())
  .then((plainWallets) => dispatch(createDefaultPortfolio())
    .then(() => {
      const plainWalletsById = plainWallets.reduce((byId, plainWallet) => ({ ...byId, [plainWallet.id]: plainWallet }), {})
      const portfolios = plainWallets.filter(({ type }) => type === MultiWallet.type)
      const allWalletIds = plainWallets.map(({ id }) => id)
      const portfolioWalletIds = portfolios.map(({ id }) => id)
      const reachableWalletIds = getReachableWalletIds(plainWalletsById, portfolioWalletIds)
      const orphanedWalletIds = difference(allWalletIds, reachableWalletIds)
      log.debug('portfolioWalletIds', portfolioWalletIds)
      log.debug('reachableWalletIds', reachableWalletIds)
      log.debug('orphanedWalletIds', orphanedWalletIds)
      portfolioWalletIds.forEach((id) => dispatch(portfolioAdded(id)))
      dispatch(addNestedWallets(defaultPortfolioId, ...orphanedWalletIds))
    }))

export const updateHoldings = (walletId) => (dispatch) => {
  return Promise.all([
    dispatch(retrieveAssetPrices()),
    dispatch(updateWalletBalances(walletId)),
  ]).catch(log.error)
}

export const updateAllHoldings = () => (dispatch) => {
  return Promise.all([
    dispatch(retrieveAssetPrices()),
    dispatch(updateWalletBalances(defaultPortfolioId)),
  ]).catch(log.error)
}

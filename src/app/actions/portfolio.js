import { createAction } from 'redux-act'

import config from 'Config'
import log from 'Utilities/log'
import { MultiWallet } from 'Services/Wallet'

import {
  addWallet, removeWallet, addNestedWallet, restoreAllWallets, updateWalletBalances,
} from 'Actions/wallet'
import { retrieveAssetPrices } from 'Actions/asset'

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

const createDefaultPortfolio = () => (dispatch) => Promise.resolve()
  .then(() => {
    const wallet = new MultiWallet(defaultPortfolioId)
    wallet.setPersistAllowed(false)
    wallet.setLabel('My Portfolio')
    return dispatch(addPortfolio(wallet, false))
  })

export const restoreAllPortfolios = () => (dispatch) => dispatch(restoreAllWallets())
  .then((plainWallets) => dispatch(createDefaultPortfolio())
    .then(() => Promise.all(plainWallets.map(({ id, type }) => {
      if (type === MultiWallet.type) {
        dispatch(portfolioAdded(id))
      } else {
        return dispatch(addNestedWallet(defaultPortfolioId, id))
      }
    }))))

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

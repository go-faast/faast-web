import { isString } from 'lodash'
import { push } from 'react-router-redux'

import routes from 'Routes'
import log from 'Log'
import toastr from 'Utilities/toastrWrapper'

import { newScopedCreateAction } from 'Utilities/action'
import walletService, { EthereumWalletViewOnly } from 'Services/Wallet'
import { isValidAddress } from 'Utilities/addressFormat'

import { getWallet, getAccountSearchResultId, getCurrentPortfolio } from 'Selectors'
import { addWallet, updateWalletBalances } from 'Actions/wallet'
import { openWalletAndRedirect } from 'Actions/access'
import { setCurrentPortfolioAndWallet } from 'Actions/portfolio'

const createAction = newScopedCreateAction(__filename)

export const setAccountSearchQuery = createAction('SET_QUERY')
export const setAccountSearchError = createAction('SET_ERROR')
export const setAccountSearchResult = createAction('SET_RESULT')

/** Open a temporary view only wallet for an address */
export const searchAddress = (addressPromise) => (dispatch, getState) => Promise.resolve(addressPromise)
  .then((address) => {
    dispatch(setAccountSearchQuery(address))
    if (!(address && isValidAddress(address, 'ETH'))) {
      toastr.error('Not a valid Ethereum address')
      throw new Error('The address provided is not a valid Ethereum address.')
    }
    const walletInstance = new EthereumWalletViewOnly(address)
    walletInstance.setPersistAllowed(false)
    const wallet = getWallet(getState(), walletInstance.getId())
    if (wallet) {
      return wallet
    }
    return dispatch(addWallet(walletInstance))
  })
  .then(({ id }) => {
    dispatch(setAccountSearchResult(id))
    return dispatch(updateWalletBalances(id))
  })
  .catch((e) => dispatch(setAccountSearchError(isString(e) ? e : e.message)))

export const viewInPortfolio = () => (dispatch, getState) => Promise.resolve().then(() => {
  const resultId = getAccountSearchResultId(getState())
  const portfolio = getCurrentPortfolio(getState())
  let walletId = resultId
  if (!portfolio.nestedWalletIds.includes(resultId)) {
    const parent = portfolio.nestedWallets.find((w) => w.transitiveNestedWalletIds.includes(resultId))
    if (parent) {
      walletId = parent.id
    } else {
      log.error(`search result wallet ${resultId} not in current portfolio`)
      walletId = portfolio.id
    }
  }
  dispatch(setCurrentPortfolioAndWallet(portfolio.id, walletId))
  dispatch(push(routes.dashboard()))
})

export const addToPortfolio = (forwardURL) => (dispatch, getState) => Promise.resolve().then(() => {
  const resultId = getAccountSearchResultId(getState())
  const walletInstance = walletService.get(resultId)
  walletInstance.setPersistAllowed(true)
  return dispatch(openWalletAndRedirect(walletInstance, forwardURL))
})

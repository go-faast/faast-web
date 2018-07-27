import { isString } from 'lodash'
import { push } from 'react-router-redux'

import routes from 'Routes'

import { newScopedCreateAction } from 'Utilities/action'
import { isValidAddress } from 'Utilities/wallet'
import walletService, { EthereumWalletViewOnly } from 'Services/Wallet'

import { getWallet, getAccountSearchResultId } from 'Selectors'
import { addWallet, updateWalletBalances } from 'Actions/wallet'
import { openWalletAndRedirect } from 'Actions/access'
import { setCurrentWallet } from 'Actions/portfolio'

const createAction = newScopedCreateAction(__filename)

export const setAccountSearchQuery = createAction('SET_QUERY')
export const setAccountSearchError = createAction('SET_ERROR')
export const setAccountSearchResult = createAction('SET_RESULT')

/** Open a temporary view only wallet for an address */
export const searchAddress = (addressPromise) => (dispatch, getState) => Promise.resolve(addressPromise)
  .then((address) => {
    dispatch(setAccountSearchQuery(address))
    if (!(address && isValidAddress(address))) {
      return dispatch(setAccountSearchError('Invalid address'))
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
  dispatch(setCurrentWallet(resultId))
  dispatch(push(routes.dashboard()))
})

export const addToPortfolio = () => (dispatch, getState) => Promise.resolve().then(() => {
  const resultId = getAccountSearchResultId(getState())
  const walletInstance = walletService.get(resultId)
  walletInstance.setPersistAllowed(true)
  return dispatch(openWalletAndRedirect(walletInstance))
})

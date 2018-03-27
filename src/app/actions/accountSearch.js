import { createAction } from 'redux-act'
import { isString } from 'lodash'

import walletService, { EthereumWalletViewOnly } from 'Services/Wallet'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'

import { getWallet, getAccountSearchResultId } from 'Selectors'
import { addWallet, updateWalletBalances } from 'Actions/wallet'
import { openWalletAndRedirect } from 'Actions/access'

export const setAccountSearchQuery = createAction('SET_ACCOUNT_SEARCH_QUERY')
export const setAccountSearchError = createAction('SET_ACCOUNT_SEARCH_ERROR')
export const setAccountSearchResult = createAction('SET_ACCOUNT_SEARCH_RESULT')

/** Open a temporary view only wallet for an address */
export const searchAddress = (addressPromise) => (dispatch, getState) => Promise.resolve(addressPromise)
  .then((address) => {
    dispatch(setAccountSearchQuery(address))
    if (!(address && isValidAddress(address))) {
      return dispatch(setAccountSearchError('Invalid address'))
    }
    const wallet = getWallet(getState(), address.toLowerCase())
    if (wallet) {
      return wallet
    }
    address = toChecksumAddress(address)
    const walletInstance = new EthereumWalletViewOnly(address)
    walletInstance.setPersistAllowed(false)
    return dispatch(addWallet(walletInstance))
  })
  .then(({ id }) => {
    dispatch(setAccountSearchResult(id))
    return dispatch(updateWalletBalances(id))
  })
  .catch((e) => dispatch(setAccountSearchError(isString(e) ? e : e.message)))

export const addToPortfolio = () => (dispatch, getState) => Promise.resolve().then(() => {
  const resultId = getAccountSearchResultId(getState())
  const walletInstance = walletService.get(resultId)
  walletInstance.setPersistAllowed(true)
  return dispatch(openWalletAndRedirect(walletInstance))
})
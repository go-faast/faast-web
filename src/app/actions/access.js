import { push } from 'react-router-redux'

import log from 'Utilities/log'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import toastr from 'Utilities/toastrWrapper'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'

import web3 from 'Services/Web3'
import { Wallet, MultiWallet, EthereumWalletKeystore, EthereumWalletWeb3, EthereumWalletViewOnly } from 'Services/Wallet'

import { getCurrentPortfolio, getWallet } from 'Selectors'
import {
  addWallet, addNestedWallet
} from 'Actions/wallet'
import { defaultPortfolioId, setCurrentWallet, restoreSwapsForWallet } from 'Actions/portfolio'

/** Open a wallet, add it to the current portfolio, and restore swaps status for it */
export const openWallet = (walletInstancePromise) => (dispatch, getState) => Promise.resolve(walletInstancePromise)
  .then((walletInstance) => {
    if (!(walletInstance instanceof Wallet)) {
      throw new Error('Instance of Wallet required')
    }
    return dispatch(addWallet(walletInstance))
  })
  .then((wallet) => {
    const { id: walletId } = wallet
    const { id: portfolioId, type: portfolioType } = getCurrentPortfolio(getState())
    return dispatch(addNestedWallet(defaultPortfolioId, walletId))
      .then(() => {
        if (portfolioType === MultiWallet.type && portfolioId !== defaultPortfolioId) {
          return dispatch(addNestedWallet(portfolioId, walletId))
        }
      })
      .then(() => dispatch(setCurrentWallet(portfolioId, walletId)))
      .then(() => dispatch(restoreSwapsForWallet(walletId)))
  })

/** Do everything in openWallet and then redirect to the dashboard */
export const openWalletAndRedirect = (walletInstancePromise) => (dispatch) => Promise.resolve(walletInstancePromise)
  .then((walletInstance) => dispatch(openWallet(walletInstance)))
  .then(() => dispatch(push('/dashboard')))
  .catch((e) => {
    log.error(e)
    toastr.error(e.message)
  })

export const openWeb3Wallet = () => (dispatch) => {
  if (web3.providerType !== 'user') {
    return toastr.error(`Please enable the ${name} extension`)
  }

  if (!web3.version || !web3.eth.net.getId) {
    return toastr.error('Unable to determine network ID')
  }
  web3.eth.net.getId((err, id) => {
    if (err) {
      log.error(err)
      return toastr.error('Error getting network ID')
    }
    if (id !== 1) {
      return toastr.error(`Please adjust ${name} to use the "Main Ethereum Network"`, { timeOut: 10000 })
    }
    dispatch(openWalletAndRedirect(EthereumWalletWeb3.fromDefaultAccount()))
  })
}

export const openKeystoreFileWallet = (files) => (dispatch) => {
  const file = files[0]
  const reader = new window.FileReader()

  reader.onload = (event) => {
    const encryptedWalletString = event.target.result
    if (!encryptedWalletString) return toastr.error('Unable to read keystore file')

    const wallet = new EthereumWalletKeystore(encryptedWalletString)
    dispatch(openWalletAndRedirect(wallet))
  }

  reader.readAsText(file)
}

export const openBlockstackWallet = () => (dispatch) => {
  if (!blockstack.isUserSignedIn()) {
    blockstack.redirectToSignIn(filterUrl())
  } else {
    const wallet = blockstack.createWallet()
    if (!wallet) {
      toastr.error('Unable to open Blockstack wallet')
    }
    dispatch(openWalletAndRedirect(wallet))
  }
}

/** Opens a view only wallet and adds it to the current portfolio */
export const openViewOnlyWallet = (address) => (dispatch) => {
  address = typeof address === 'string' ? address.trim() : ''
  if (!isValidAddress(address)) {
    toastr.error('Not a valid address')
  } else {
    address = toChecksumAddress(address)
    const wallet = new EthereumWalletViewOnly(address)
    dispatch(openWalletAndRedirect(wallet))
  }
}

/** Open a temporary view only wallet as its own portfolio. */
export const createViewOnlyPortfolio = (address, setCurrent = false) => (dispatch, getState) => Promise.resolve()
  .then(() => {
    if (!address) {
      throw new Error('invalid view only address')
    }
    const wallet = getWallet(getState(), address)
    if (!wallet) {
      const walletInstance = new EthereumWalletViewOnly(address)
      walletInstance.setPersistAllowed(false)
      return dispatch(addWallet(walletInstance))
    }
    return wallet
  })
  .then((wallet) => {
    if (setCurrent) {
      const { id, isReadOnly } = wallet
      // If the wallet was already connected it won't be read only
      const portfolioId = isReadOnly ? id : defaultPortfolioId
      dispatch(setCurrentWallet(portfolioId, id))
    }
    return wallet
  })
import { push } from 'react-router-redux'
import { isString } from 'lodash'

import routes from 'Routes'
import config from 'Config'
import log from 'Utilities/log'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import toastr from 'Utilities/toastrWrapper'
import { isValidAddress } from 'Utilities/addressFormat'
import { toChecksumAddress } from 'Utilities/convert'

import { getUserWeb3 } from 'Services/Web3'
import {
  Wallet, MultiWallet, EthereumWalletKeystore,
  EthereumWalletWeb3, EthereumWalletViewOnly
} from 'Services/Wallet'

import { getCurrentPortfolio, getWallet, isWalletAdded, getConnectForwardUrl } from 'Selectors'
import { addWallet, addNestedWallet, updateWalletBalances } from 'Actions/wallet'
import { defaultPortfolioId } from 'Actions/portfolio'
import { retrieveSwaps } from 'Actions/swap'

/** Add a wallet, load balances and retrieve swap history */
export const loadWallet = (walletPromise) => (dispatch, getState) => Promise.resolve(walletPromise)
  .then((wallet) => {
    if (isString(wallet)) {
      wallet = getWallet(getState(), wallet)
    }
    if (wallet instanceof Wallet) {
      return dispatch(addWallet(wallet))
    } else if (wallet.id && wallet.type) {
      return wallet
    } else {
      throw new Error('Invalid wallet: cannot open')
    }
  })
  .then((wallet) => {
    const { id: walletId } = wallet

    // Background tasks
    dispatch(updateWalletBalances(walletId))
    dispatch(retrieveSwaps(walletId))

    return wallet
  })

/** Load a wallet, add it to the current portfolio, and optionally redirect user to another page */
export const openWallet = (walletPromise, forwardUrl) => (dispatch, getState) =>
  dispatch(loadWallet(walletPromise))
    .then((wallet) => {
      const { id: walletId } = wallet
      const { id: portfolioId, type: portfolioType } = getCurrentPortfolio(getState())
      return dispatch(addNestedWallet(defaultPortfolioId, walletId))
        .then(() => {
          if (portfolioType === MultiWallet.type && portfolioId !== defaultPortfolioId) {
            return dispatch(addNestedWallet(portfolioId, walletId))
          }
        })
    })
    .then(() => {
      forwardUrl = forwardUrl ? forwardUrl : (getConnectForwardUrl(getState()) || '/dashboard')
      if (forwardUrl) {
        dispatch(push(forwardUrl))
      }
    })

/** Do everything in openWallet and then redirect to the dashboard */
export const openWalletAndRedirect = (walletPromise, forwardUrl) => (dispatch) =>
  dispatch(openWallet(walletPromise, forwardUrl))
    .catch((e) => {
      log.error(e)
      toastr.error(e.message)
    })

export const openWeb3Wallet = (selectedProvider, forwardUrl) => (dispatch) => {
  return getUserWeb3()
    .then(() => dispatch(openWalletAndRedirect(
      EthereumWalletWeb3.fromDefaultAccount(selectedProvider),
      forwardUrl)))
    .catch((e) => {
      log.error(e)
      const providerName = config.walletTypes[selectedProvider].name
      let message = e.message
      if (message !== 'Unsupported network') {
        if (selectedProvider !== 'trust') {
          dispatch(push(routes.walletInfoModal(selectedProvider)))
          return
        } else {
          window.location.href = 'https://links.trustwalletapp.com/SBr41u7nVR?&event=openURL&url=https://faa.st/app/connect'
        }
      }
      if (message === 'No web3 provider detected') {
        message = `Cannot connect to ${providerName}`
      } else if (message === 'Unsupported network') {
        message = `Please adjust ${providerName} to use the Main Ethereum Network`
      } else {
        message = `Error connecting to ${providerName}: ${message}`
      }
      toastr.error(message)
    })
}

export const openKeystoreFileWallet = (filesPromise, forwardUrl) => (dispatch) => Promise.resolve(filesPromise)
  .then((files) => {
    const file = files[0]
    const reader = new window.FileReader()

    reader.onload = (event) => {
      const encryptedWalletString = event.target.result
      if (!encryptedWalletString) return toastr.error('Unable to read keystore file')

      const wallet = new EthereumWalletKeystore(encryptedWalletString)
      dispatch(openWalletAndRedirect(wallet, forwardUrl))
    }

    reader.readAsText(file)
  })

export const openBlockstackWallet = (forwardUrl) => (dispatch) => Promise.resolve().then(() => {
  if (!blockstack.isUserSignedIn()) {
    blockstack.redirectToSignIn(filterUrl())
  } else {
    const wallet = blockstack.createWallet()
    if (!wallet) {
      return toastr.error('Unable to open Blockstack wallet')
    }
    return dispatch(openWalletAndRedirect(wallet, forwardUrl))
  }
})

/** Opens a view only wallet and adds it to the current portfolio */
export const openViewOnlyWallet = (addressPromise, forwardUrl) => (dispatch, getState) => Promise.resolve(addressPromise)
  .then((address) => {
    address = typeof address === 'string' ? address.trim() : ''
    if (!isValidAddress(address, 'ETH')) {
      return toastr.error('Not a valid view only address')
    }
    address = toChecksumAddress(address)
    const wallet = new EthereumWalletViewOnly(address)
    const walletId = wallet.getId()
    if (isWalletAdded(getState(), walletId)) {
      log.debug(`Wallet ${walletId} already added`)
      return
    }
    return dispatch(openWalletAndRedirect(wallet, forwardUrl))
  })

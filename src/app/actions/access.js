import { push } from 'react-router-redux'
import { isString } from 'lodash'

import log from 'Utilities/log'
import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import toastr from 'Utilities/toastrWrapper'
import { isValidAddress } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'

import web3 from 'Services/Web3'
import {
  Wallet, MultiWallet, EthereumWalletKeystore,
  EthereumWalletWeb3, EthereumWalletViewOnly
} from 'Services/Wallet'

import { getCurrentPortfolio, getWallet } from 'Selectors'
import { addWallet, addNestedWallet, updateWalletBalances } from 'Actions/wallet'
import { defaultPortfolioId } from 'Actions/portfolio'
import { retrieveSwaps } from 'Actions/swap'

/** Add a wallet, add it to the current portfolio, and restore swap status */
export const openWallet = (walletPromise) => (dispatch, getState) => Promise.resolve(walletPromise)
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
    const { id: portfolioId, type: portfolioType } = getCurrentPortfolio(getState())
    return dispatch(addNestedWallet(defaultPortfolioId, walletId))
      .then(() => {
        if (portfolioType === MultiWallet.type && portfolioId !== defaultPortfolioId) {
          return dispatch(addNestedWallet(portfolioId, walletId))
        }
        dispatch(updateWalletBalances(walletId))
      })
      .then(() => dispatch(retrieveSwaps(walletId)))
  })

/** Do everything in openWallet and then redirect to the dashboard */
export const openWalletAndRedirect = (walletPromise, forwardURL) => (dispatch) => Promise.resolve(walletPromise)
  .then((wallet) => dispatch(openWallet(wallet)))
  .then(() => dispatch(push(forwardURL)))
  .catch((e) => {
    log.error(e)
    toastr.error(e.message)
  })

export const openWeb3Wallet = () => (dispatch) => Promise.resolve().then(() => {
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
})

export const openKeystoreFileWallet = (filesPromise) => (dispatch) => Promise.resolve(filesPromise)
  .then((files) => {
    const file = files[0]
    const reader = new window.FileReader()

    reader.onload = (event) => {
      const encryptedWalletString = event.target.result
      if (!encryptedWalletString) return toastr.error('Unable to read keystore file')

      const wallet = new EthereumWalletKeystore(encryptedWalletString)
      dispatch(openWalletAndRedirect(wallet))
    }

    reader.readAsText(file)
  })

export const openBlockstackWallet = () => (dispatch) => Promise.resolve().then(() => {
  if (!blockstack.isUserSignedIn()) {
    blockstack.redirectToSignIn(filterUrl())
  } else {
    const wallet = blockstack.createWallet()
    if (!wallet) {
      return toastr.error('Unable to open Blockstack wallet')
    }
    return dispatch(openWalletAndRedirect(wallet))
  }
})

/** Opens a view only wallet and adds it to the current portfolio */
export const openViewOnlyWallet = (addressPromise) => (dispatch) => Promise.resolve(addressPromise)
  .then((address) => {
    address = typeof address === 'string' ? address.trim() : ''
    if (!isValidAddress(address)) {
      return toastr.error('Not a valid address')
    } 
    address = toChecksumAddress(address)
    const wallet = new EthereumWalletViewOnly(address)
    return dispatch(openWalletAndRedirect(wallet))
  })

import { push } from 'react-router-redux'

import { filterUrl } from 'Utilities/helpers'
import blockstack from 'Utilities/blockstack'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

import web3 from 'Services/Web3'
import { EthereumWalletKeystore, EthereumWalletWeb3 } from 'Services/Wallet'

import { openWallet } from 'Actions/portfolio'


const handleOpenWalletError = (e) => {
  log.error(e)
  toastr.error(e.message)
}

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

    EthereumWalletWeb3.fromDefaultAccount()
      .then((wallet) => dispatch(openWallet(wallet)))
      .then(() => dispatch(push('/balances')))
      .catch(handleOpenWalletError)
  })
}

export const openKeystoreFileWallet = (files) => (dispatch) => {
  const file = files[0]
  const reader = new window.FileReader()

  reader.onload = (event) => {
    const encryptedWalletString = event.target.result
    if (!encryptedWalletString) return toastr.error('Unable to read keystore file')

    dispatch(openWallet(new EthereumWalletKeystore(encryptedWalletString))
      .then(() => {
        log.info('Encrypted wallet set')
        dispatch(push('/balances'))
      }))
      .catch(handleOpenWalletError)
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
    openWallet(wallet)
      .then(() => dispatch(push('/balances')))
      .catch(handleOpenWalletError)
  }
}
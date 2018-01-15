import queryString from 'query-string'
import blockstack from 'Utilities/blockstack'
import { sessionStorageGet, sessionStorageSet } from 'Utilities/storage'
import { WalletSerializer, MultiWallet } from 'Services/Wallet'

export const closeTrezorWindow = () => {
  if (window.faast.hw && window.faast.hw.trezor && window.faast.hw.trezor.close) window.faast.hw.trezor.close()
}

export const getTransactionReceipt = (txHash) => {
  return window.faast.web3.eth.getTransactionReceipt(txHash)
}

const walletStorageKey = 'wallet'

export const restoreWallet = () => {
  if (blockstack.isUserSignedIn()) {
    return blockstack.createWallet()
  }
  const query = queryString.parse(window.location.search)
  let wallet
  if (query.wallet) {
    const encryptedWalletString = Buffer.from(query.wallet, 'base64').toString()
    const wallet = WalletSerializer.parse(encryptedWalletString)
    if (wallet) {
      sessionStorageSet(walletStorageKey, encryptedWalletString)
    }
  } else {
    wallet = WalletSerializer.parse(sessionStorageGet(walletStorageKey))
  }
  if (!wallet) {
    wallet = new MultiWallet()
  } else if (!(wallet instanceof MultiWallet)) {
    wallet = new MultiWallet([wallet])
  }
  window.faast.wallet = wallet
  return wallet
}

export const saveWallet = (wallet) => {
  if (wallet) {
    sessionStorageSet(walletStorageKey, WalletSerializer.stringify(wallet))
  }
}

export const isValidAddress = (address) => {
  return window.faast.web3.utils.isAddress(address)
}

import { omit } from 'lodash'

import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

import { web3SendTx } from './util'
import EthereumWallet from './EthereumWallet'

const checkAccountAvailable = (address) => Promise.resolve(address)
  .then((resolvedAddress) => web3.eth.getAccounts()
    .then((accounts) => accounts
      .map((account) => account.toLowerCase())
      .includes(resolvedAddress.toLowerCase()))
    .then((isAvailable) => {
      if (!isAvailable) {
        throw new Error(`Could not find web3 Ethereum account ${resolvedAddress}`)
      }
    }))

export default class EthereumWalletWeb3 extends EthereumWallet {

  static type = 'EthereumWalletWeb3';

  constructor(address, providerName, label) {
    if (!address) {
      throw new Error('Wallet address must be provided')
    }
    super(address, label)
    this.providerName = providerName || web3.providerName
  }

  getType() { return EthereumWalletWeb3.type }

  getTypeLabel() { return this.providerName === 'faast' ? 'Web3 Wallet' : this.providerName }

  isSignTransactionSupported() { return web3.providerName !== 'MetaMask' }

  _checkAvailable() { return checkAccountAvailable(this.address) }

  _signAndSendTx(tx, options) {
    return web3SendTx(tx.txData, false, options)
      .then((txId) => ({ id: txId }));
  }

  _signTx(tx) {
    const { txData } = tx
    const { value, gasLimit, gasPrice, nonce } = txData
    return web3.eth.signTransaction({
      ...omit(txData, 'chainId'),
      value: toBigNumber(value),
      gas: toBigNumber(gasLimit).toNumber(),
      gasPrice: toBigNumber(gasPrice),
      nonce: toBigNumber(nonce).toNumber()
    })
  }

  static fromDefaultAccount() {
    const { defaultAccount, getAccounts } = web3.eth
    let addressPromise
    if (defaultAccount) {
      addressPromise = Promise.resolve(toChecksumAddress(defaultAccount))
    } else {
      addressPromise = getAccounts()
        .catch((err) => {
          log.error(err)
          throw new Error(`Error retrieving ${web3.providerName} account`)
        })
        .then(([address]) => {
          if (!address) {
            throw new Error(`Unable to retrieve ${web3.providerName} account. Please ensure your account is unlocked.`)
          }
          return address
        })
    }
    return addressPromise.then((address) => new EthereumWalletWeb3(address))
  }

}

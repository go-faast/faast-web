import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

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

const providerToIconUrl = {
  MetaMask: 'https://faa.st/img/metamask-logo.png',
  Mist: 'https://faa.st/img/mist-logo.png',
  Parity: 'https://faa.st/img/parity-logo.svg', 
}

export default class EthereumWalletWeb3 extends EthereumWallet {

  constructor(address, providerName) {
    super('EthereumWalletWeb3')
    if (!address) {
      throw new Error('Wallet address must be provided')
    }
    this.address = address
    this.providerName = providerName || web3.providerName
  }

  getTypeLabel = () => this.providerName === 'faast' ? 'Web3 Wallet' : this.providerName;

  getIconUrl = () => providerToIconUrl[this.providerName] || 'https://faa.st/img/coins/coin_ETH.png';

  getAddress = () => this.address;

  _checkAvailable = () => checkAccountAvailable(this.address);

  sendTransaction = ({ txData: tx }, options = {}) => {
    const { onTxHash, onReceipt, onConfirmation, onError } = options
    return Promise.resolve(tx)
      .then(this._assignNonce)
      .then((tx) => web3.eth.sendTransaction({
        ...tx,
        value: toBigNumber(tx.value),
        gas: toBigNumber(tx.gasLimit).toNumber(),
        gasPrice: toBigNumber(tx.gasPrice),
        nonce: toBigNumber(tx.nonce).toNumber()
      }).once('transactionHash', onTxHash)
        .once('receipt', onReceipt)
        .on('confirmation', onConfirmation)
        .on('error', onError))
        .catch(onError)
  };

  static fromDefaultAccount = () => {
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
  };

}
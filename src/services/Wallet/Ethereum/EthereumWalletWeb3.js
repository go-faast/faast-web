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

export default class EthereumWalletWeb3 extends EthereumWallet {

  constructor(address) {
    super('EthereumWalletWeb3')
    this.address = address
    this.providerName = web3.providerName
  }

  getAddress = () => this.address;

  _checkAvailable = () => checkAccountAvailable(this.address);

  transfer = (toAddress, amount, assetOrSymbol) => {
    return Promise.resolve(assetOrSymbol)
      .then(this.assertAssetSupported)
      .then(this._checkAvailable)
      .then((asset) => this._createTransferTx(toAddress, amount, asset)
        .then((tx) => ({
          ...tx,
          value: toBigNumber(tx.value),
          gas: toBigNumber(tx.gasLimit).toNumber(),
          gasPrice: toBigNumber(tx.gasPrice),
          nonce: toBigNumber(tx.nonce).toNumber()
        })
        .then(web3.eth.sendTransaction)))
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
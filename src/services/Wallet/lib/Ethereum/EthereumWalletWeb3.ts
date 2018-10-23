import { omit } from 'lodash'

import web3 from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

import { web3SendTx } from './util'
import EthereumWallet from './EthereumWallet'
import { Transaction } from '../types'
import { EthTransaction } from './types'

const checkAccountAvailable = (address: string) => Promise.resolve(address)
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

  constructor(address: string, public providerName: string = web3.providerName, label?: string) {
    super(address, label)
  }

  getType() { return EthereumWalletWeb3.type }

  getTypeLabel() { return this.providerName === 'faast' ? 'Web3 Wallet' : this.providerName }

  // Most popular web3 wallets don't currently support signTransaction even though it's part of the web3 1.0 interface
  isSignTransactionSupported() { return false }

  _checkAvailable() { return checkAccountAvailable(this.address) }

  _signAndSendTx(tx: Transaction, options: object): Promise<Partial<EthTransaction>> {
    return web3SendTx(tx.txData, options)
      .then((hash) => ({ hash }));
  }

  _signTx(tx: EthTransaction): Promise<Partial<EthTransaction>> {
    const { txData } = tx
    const { value, gas, gasPrice, nonce } = txData
    return web3.eth.signTransaction(omit(txData, 'chainId'))
      .then((signedTxData) => ({ signedTxData }))
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

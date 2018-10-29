import { omit } from 'lodash'

import config from 'Config'
import { getUserWeb3, Web3 } from 'Services/Web3'
import log from 'Utilities/log'
import { toChecksumAddress, toBigNumber } from 'Utilities/convert'

import { web3SendTx } from './util'
import EthereumWallet from './EthereumWallet'
import { Transaction } from '../types'
import { EthTransaction } from './types'

const VALID_PROVIDER_NAMES = ['faast', ...config.web3WalletTypes]

export default class EthereumWalletWeb3 extends EthereumWallet {

  static type = 'EthereumWalletWeb3';

  _web3: Promise<Web3>

  constructor(address: string, public providerName: string = 'faast', label?: string, userWeb3?: Web3) {
    super(address, label)
    if (!VALID_PROVIDER_NAMES.includes(providerName)) {
      throw new Error(`Unsupported web3 provider ${providerName}`)
    }
    this._web3 = userWeb3 ? Promise.resolve(userWeb3) : getUserWeb3()
  }

  getType() { return EthereumWalletWeb3.type }

  getTypeLabel(): string {
    return this.providerName === 'faast'
      ? 'Web3 Wallet'
      : ((config.walletTypes[this.providerName] || {}).name || this.providerName)
  }

  // Most popular web3 wallets don't currently support signTransaction even though it's part of the web3 1.0 interface
  isSignTransactionSupported() { return false }

  _signAndSendTx(tx: Transaction, options: object): Promise<Partial<EthTransaction>> {
    return this._web3.then((web3) =>
      web3SendTx(web3, tx.txData, options)
        .then((hash) => ({ hash })));
  }

  _signTx(tx: EthTransaction): Promise<Partial<EthTransaction>> {
    const { txData } = tx
    const { value, gas, gasPrice, nonce } = txData
    return this._web3.then((web3) =>
      web3.eth.signTransaction(omit(txData, 'chainId'))
      .then((signedTxData) => ({ signedTxData })))
  }

  static fromDefaultAccount(providerName?: string) {
    return getUserWeb3().then((web3) => {
      const { defaultAccount, getAccounts } = web3.eth
      let addressPromise
      if (defaultAccount) {
        addressPromise = Promise.resolve(toChecksumAddress(defaultAccount))
      } else {
        addressPromise = getAccounts()
          .catch((err) => {
            log.error(err)
            throw new Error(`Error retrieving ${providerName} account`)
          })
          .then(([address]) => {
            if (!address) {
              throw new Error(`Unable to retrieve ${providerName} account. Please ensure your account is unlocked.`)
            }
            return address
          })
      }
      return addressPromise.then((address) => new EthereumWalletWeb3(address, providerName, undefined, web3))
    })
  }

}

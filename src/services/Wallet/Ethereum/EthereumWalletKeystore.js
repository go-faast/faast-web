import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'

import config from 'Config'
import log from 'Utilities/log'
import { stripHexPrefix, parseJson } from 'Utilities/helpers'
import { toChecksumAddress } from 'Utilities/convert'

import EthereumWalletSigner from './EthereumWalletSigner'

export default class EthereumWalletKeystore extends EthereumWalletSigner {

  constructor(keystore) {
    super('EthereumWalletKeystore')
    if (keystore instanceof EthereumjsWallet) {
      this.isEncrypted = false
    } else {
      keystore = parseJson(keystore)
      if (!keystore) {
        throw new Error('Invalid keystore')
      }
      let version = keystore.version || keystore.Version
      if (typeof version === 'undefined') {
        throw new Error('Keystore version information missing')
      }
      if (version !== 3) {
        throw new Error(`Unsupported keystore version: ${keystore.version}`)
      }
      if (!(keystore.crypto || keystore.Crypto)) {
        throw new Error('Keystore crypto information missing')
      }
      this.isEncrypted = true
    }
    this.keystore = keystore
  }

  static generate = () => {
    return new EthereumWalletKeystore(EthereumjsWallet.generate())
  };

  static fromPrivateKey = (privateKey) => {
    const pk = Buffer.from(stripHexPrefix(privateKey.trim()), 'hex')
    return new EthereumWalletKeystore(EthereumjsWallet.fromPrivateKey(pk))
  };

  static fromJson = (jsonKeystore) => {
    return new EthereumWalletKeystore(jsonKeystore)
  };

  getAddress = () => toChecksumAddress(this.keystore.address || this.keystore.Address || this.keystore.getAddressString());

  encrypt = (password = '') => {
    if (this.isEncrypted) {
      return this
    }
    return new EthereumWalletKeystore(this.keystore.toV3(password, config.encrOpts))
  };

  decrypt = (password) => {
    if (!this.isEncrypted) {
      return this
    }
    if (typeof password === 'undefined' || password === null) {
      password = window.prompt(`Enter password for Ethereum account ${this.address}`)
    }
    if (typeof password !== 'string') {
      throw new Error('Password is required')
    }
    return new EthereumWalletKeystore(EthereumjsWallet.fromV3(this.keystore, password, true))
  };

  signTx = (txParams, { password }) => {
    return Promise.resolve(txParams)
      .then(this._validateTx)
      .then(() => {
        if (this.isEncrypted) {
          return this.decrypt(password).signTx(txParams)
        }
        const tx = new EthereumjsTx(txParams)
        tx.sign(this.keystore.getPrivateKey())
        return tx.serialize().toString('hex')
      })
  };

  getFileName = (password) => {
    return Promise.resolve(this.decrypt(password).keystore.getV3Filename())
  };

  getPrivateKeyString = (password, mock) => {
    if (mock) return Promise.resolve('mock_pk_123')
    return Promise.resolve(this.wallet.decrypt(password).keystore.getPrivateKeyString())
  };

}
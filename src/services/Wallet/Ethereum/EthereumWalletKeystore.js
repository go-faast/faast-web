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
    this.keystore = keystore
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

  getId = () => `${this.type}-${this.keystore.address}`;

  encrypt = (password = '') => {
    if (this.isEncrypted) {
      return this
    }
    return new EthereumWalletKeystore(this.keystore.toV3(password, config.encrOpts))
  };

  decrypt = (password = '') => {
    if (!this.isEncrypted) {
      return this
    }
    return new EthereumWalletKeystore(EthereumjsWallet.fromV3(this.keystore, password, true))
  };

  signTx = (txParams) => {
    if (this.isEncrypted) {
      return Promise.reject(new Error('Wallet is encrypted'))
    }
    return Promise.resolve(txParams)
      .then(this._validateTx)
      .then(() => {
        const tx = new EthereumjsTx(txParams)
        tx.sign(this.keystore.getPrivateKey())
        return tx.serialize().toString('hex')
      })
  };

  getAddress = () => {
    return Promise.resolve(toChecksumAddress(this.keystore.address || this.keystore.Address || this.wallet.getAddress()))
  };

  getFileName = (password) => {
    return this.decrypt(password).keystore.getV3Filename()
  };

  getPrivateKeyString = (password, mock) => {
    if (mock) return 'mock_pk_123'
    return this.wallet.decrypt(password).keystore.getPrivateKeyString()
  };

}
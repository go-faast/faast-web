import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'

import config from 'Config'
import { stripHexPrefix, parseJson } from 'Utilities/helpers'
import { toChecksumAddress } from 'Utilities/convert'

import EthereumWallet from './EthereumWallet'

export default class EthereumWalletKeystore extends EthereumWallet {

  static type = 'EthereumWalletKeystore';

  constructor(keystore) {
    super()
    if (keystore instanceof EthereumjsWallet) {
      this._isEncrypted = false
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
        throw new Error(`Keystore version ${keystore.version} unsupported`)
      }
      if (!(keystore.crypto || keystore.Crypto)) {
        throw new Error('Keystore crypto information missing')
      }
      this._isEncrypted = true
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

  getType = () => EthereumWalletKeystore.type;

  getTypeLabel = () => 'Keystore file';

  getAddress = () => toChecksumAddress(this.keystore.address || this.keystore.Address || this.keystore.getAddressString());

  isPersistAllowed = () => this._isEncrypted && this._persistAllowed;

  encrypt = (password = '') => {
    if (this._isEncrypted) {
      return this
    }
    return new EthereumWalletKeystore(this.keystore.toV3(password, config.encrOpts))
  };

  decrypt = (password) => {
    if (!this._isEncrypted) {
      return this
    }
    if (typeof password === 'undefined' || password === null) {
      password = window.prompt(`Enter password for Ethereum account ${this.getId()}`)
    }
    if (typeof password !== 'string') {
      throw new Error('Password is required')
    }
    return new EthereumWalletKeystore(EthereumjsWallet.fromV3(this.keystore, password, true))
  };

  _signTxData = (txData, { password }) => Promise.resolve().then(() => {
    let keystore = this.keystore
    if (this._isEncrypted) {
      keystore = this.decrypt(password).keystore
    }
    const signedTx = new EthereumjsTx({ ...txData, chainId: 1 })
    signedTx.sign(keystore.getPrivateKey())
    return this._signedEthJsTxToObject(signedTx)
  });

  getFileName = (password) => {
    return Promise.resolve(this.decrypt(password).keystore.getV3Filename())
  };

  getPrivateKeyString = (password, mock) => {
    if (mock) return Promise.resolve('mock_pk_123')
    return Promise.resolve(this.decrypt(password).keystore.getPrivateKeyString())
  };

}
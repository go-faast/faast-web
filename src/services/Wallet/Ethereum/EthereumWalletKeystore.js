import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'

import config from 'Config'
import log from 'Utilities/log'
import { stripHexPrefix, parseJson } from 'Utilities/helpers'
import { toChecksumAddress } from 'Utilities/convert'

import EthereumWallet from './EthereumWallet'

const SERIAL_TYPE = 'keystore'

export default class EthereumWalletKeystore extends EthereumWallet {

  constructor(keystore, passwordCallback = null) {
    super()
    this._passwordCallback = passwordCallback
    this.keystore = keystore
    if (keystore instanceof EthereumjsWallet) {
      this.isEncrypted = false
    } else {
      keystore = (typeof keystore === 'string') ? JSON.parse(keystore) : keystore
      let version = keystore.version || keystore.Version
      if (typeof version === 'undefined') {
        throw new Error('Invalid keystore')
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

  static generate = (passwordCallback) => {
    return new EthereumWalletKeystore(EthereumjsWallet.generate(), passwordCallback)
  };

  static fromPrivateKey = (privateKey, passwordCallback) => {
    const pk = Buffer.from(stripHexPrefix(privateKey.trim()), 'hex')
    return new EthereumWalletKeystore(EthereumjsWallet.fromPrivateKey(pk), passwordCallback)
  };

  static fromJson = (jsonKeystore, passwordCallback) => {
    return new EthereumWalletKeystore(jsonKeystore, passwordCallback)
  };

  _getPassword = () => {
    if (!this._passwordCallback) {
      return Promise.reject(new Error('Password callback not defined'))
    }
    return this._passwordCallback(this).then((password) => {
      if (typeof password !== 'string') {
        throw new Error('Password must be a string')
      }
    })
  }

  _getEncryptedWallet = () => {
    if (!this.isEncrypted) {
      return this.getPassword()
        .then((password) => this.keystore.toV3(password, config.encrOpts))
    }
    return Promise.resolve(this.keystore)
  };

  _getDecryptedWallet = () => {
    if (this.isEncrypted) {
      return this.getPassword()
        .then((password) => EthereumjsWallet.fromV3(this.keystore, password, true))
    }
    return Promise.resolve(this.keystore)
  };

  encrypt = () => this._getEncryptedWallet()
    .then((encrypted) => {
      this.keystore = encrypted
      this.isEncrypted = true
    });

  decrypt = () => this._getDecryptedWallet()
    .then((decrypted) => {
      this.keystore = decrypted
      this.isEncrypted = false
    });

  signTx = (txParams, password, isMocking) => {
    this.validateTx(txParams)
    if (isMocking) {
      return 'mock_signed_123'
    }
    this.decrypt(password)
    const tx = new EthereumjsTx(txParams)
    tx.sign(this.getDecryptedWallet().getPrivateKey())
    return tx.serialize().toString('hex')
  };

  getAddress = () => {
    return toChecksumAddress(this.keystore.address || this.keystore.Address || this.wallet.getAddress())
  };

  serialize = () => {
    if (!this.isEncrypted) {
      throw new Error('Cannot serialize decrypted EthereumWalletKeystore')
    }
    return {
      type: 'keystore',
      address: this.getAddress(),
      data: this.keystore
    }
  };

  static canDeserialize = (serialized) => {
    if (!(serialized = parseJson(serialized)) || serialized.type !== SERIAL_TYPE || !serialized.data) {
      return false
    }
    return true
  };

  static deserialize = (serialized, passwordCallback) => {
    if (!EthereumWalletKeystore.canDeserialize(serialized)) {
      throw new Error('Unable to parse serialized EthereumWalletKeystore')
    }
    return EthereumWalletKeystore.fromJson(serialized.data, passwordCallback)
  };

}
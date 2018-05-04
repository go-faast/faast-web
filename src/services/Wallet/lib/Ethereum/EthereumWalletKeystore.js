import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'
import { isString, isObject, isUndefined } from 'lodash'

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
      if (!keystore) {
        throw new Error(`Invalid keystore "${keystore}"`)
      }
      // Convert keystore to lower case to avoid ethereumjs-wallet parsing issues
      if (isString(keystore)) {
        keystore = parseJson(keystore.toLowerCase())
      } else if (isObject(keystore)) {
        keystore = Object.entries(keystore).reduce((lowerCased, [key, value]) => ({
          ...lowerCased,
          [key.toLowerCase()]: value
        }), {})
      } else {
        throw new Error(`Keystore has invalid type ${typeof keystore}`)
      }
      let version = keystore.version
      if (typeof version === 'undefined') {
        throw new Error('Keystore version information missing')
      }
      if (version !== 3) {
        throw new Error(`Keystore version ${keystore.version} unsupported`)
      }
      if (!keystore.crypto) {
        throw new Error('Keystore crypto information missing')
      }
      if (!keystore.address) {
        throw new Error('Keystore address missing')
      }
      this._isEncrypted = true
    }
    this.keystore = keystore
  }

  static generate() {
    return new EthereumWalletKeystore(EthereumjsWallet.generate())
  }

  static fromPrivateKey(privateKey) {
    const pk = Buffer.from(stripHexPrefix(privateKey.trim()), 'hex')
    return new EthereumWalletKeystore(EthereumjsWallet.fromPrivateKey(pk))
  }

  static fromJson(jsonKeystore) {
    return new EthereumWalletKeystore(jsonKeystore)
  }

  getType() { return EthereumWalletKeystore.type }

  getTypeLabel() { return 'Keystore file' }

  getAddress() { return toChecksumAddress(this.keystore.address || this.keystore.getAddressString()) }

  isPersistAllowed() { return this._isEncrypted && this._persistAllowed }

  isPasswordProtected() { return this._isEncrypted }

  checkPasswordCorrect(password) {
    if (!isString(password)) {
      return false
    }
    try {
      this.decrypt(password)
      return true
    } catch(e) {
      return false
    }
  }

  encrypt(password = '') {
    if (this._isEncrypted) {
      return this
    }
    return new EthereumWalletKeystore(this.keystore.toV3(password, config.encrOpts))
  }

  decrypt(password) {
    if (!this._isEncrypted) {
      return this
    }
    if (isUndefined(password)) {
      password = window.prompt(`Enter password for Ethereum account ${this.getId()}`)
    }
    if (!isString(password)) {
      throw new Error(`Invalid password of type ${typeof password}`)
    }
    return new EthereumWalletKeystore(EthereumjsWallet.fromV3(this.keystore, password, true))
  }

  _signTx(tx, { password }) {
    return Promise.resolve().then(() => {
      let keystore = this.keystore
      if (this._isEncrypted) {
        keystore = this.decrypt(password).keystore
      }
      const signedTx = new EthereumjsTx({ ...tx.txData, chainId: 1 })
      signedTx.sign(keystore.getPrivateKey())
      return {
        signedTxData: this._signedEthJsTxToObject(signedTx)
      }
    })
  }

  getFileName(password) {
    return Promise.resolve(this.decrypt(password).keystore.getV3Filename())
  }

  getPrivateKeyString(password, mock) {
    if (mock) return Promise.resolve('mock_pk_123')
    return Promise.resolve(this.decrypt(password).keystore.getPrivateKeyString())
  }

}

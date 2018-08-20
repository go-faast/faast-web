import EthereumjsWallet from 'ethereumjs-wallet'
import EthereumjsTx from 'ethereumjs-tx'
import { isString, isObject, isUndefined } from 'lodash'

import config from 'Config'
import { stripHexPrefix, parseJson } from 'Utilities/helpers'
import { toChecksumAddress } from 'Utilities/convert'

import EthereumWallet from './EthereumWallet'
import { Transaction } from '../types'

type Keystore = {
  id: string,
  version: string,
  address: string,
  crypto: string,
}

const getKeystoreAddress = (keystore: EthereumjsWallet | Keystore) =>
  toChecksumAddress(keystore instanceof EthereumjsWallet ? keystore.getAddressString() : keystore.address)

function parseKeystore(keystoreToParse: object | string): Keystore {
  if (!keystoreToParse) {
    throw new Error(`Invalid keystore "${keystoreToParse}"`)
  }
  let keystore
  // Convert keystore to lower case to avoid ethereumjs-wallet parsing issues
  if (isString(keystoreToParse)) {
    keystore = parseJson(keystoreToParse.toLowerCase())
  } else if (isObject(keystoreToParse)) {
    keystore = Object.entries(keystoreToParse).reduce((lowerCased, [key, value]) => ({
      ...lowerCased,
      [key.toLowerCase()]: value,
    }), {})
  } else {
    throw new Error(`Keystore has invalid type ${typeof keystore}`)
  }
  const version = keystore.version
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
  return keystore
}

export default class EthereumWalletKeystore extends EthereumWallet {

  static type = 'EthereumWalletKeystore'

  keystore: EthereumjsWallet | Keystore

  constructor(keystore: EthereumjsWallet | object | string, label?: string) {
    let parsedKeystore: EthereumjsWallet | Keystore
    if (keystore instanceof EthereumjsWallet) {
      parsedKeystore = keystore
    } else {
      parsedKeystore = parseKeystore(keystore)
    }
    super(getKeystoreAddress(parsedKeystore), label)
    this.keystore = parsedKeystore
  }

  static generate() {
    return new EthereumWalletKeystore(EthereumjsWallet.generate())
  }

  static fromPrivateKey(privateKey: string) {
    const pk = Buffer.from(stripHexPrefix(privateKey.trim()), 'hex')
    return new EthereumWalletKeystore(EthereumjsWallet.fromPrivateKey(pk))
  }

  static fromJson(jsonKeystore: object | string) {
    return new EthereumWalletKeystore(jsonKeystore)
  }

  getType() { return EthereumWalletKeystore.type }

  getTypeLabel() { return 'Keystore file' }

  isPasswordProtected(): boolean { return !(this.keystore instanceof EthereumjsWallet) }

  isPersistAllowed(): boolean { return super.isPersistAllowed() && this.isPasswordProtected() }

  checkPasswordCorrect(password: string): boolean {
    if (!isString(password)) {
      return false
    }
    try {
      this.decrypt(password)
      return true
    } catch (e) {
      return false
    }
  }

  getEncryptedKeystore(password: string): Keystore {
    if (this.keystore instanceof EthereumjsWallet) {
      return this.keystore.toV3(password, config.encrOpts) as Keystore
    }
    return this.keystore
  }

  getDecryptedKeystore(password?: string): EthereumjsWallet {
    if (this.keystore instanceof EthereumjsWallet) {
      return this.keystore
    }
    if (isUndefined(password)) {
      password = window.prompt(`Enter password for Ethereum account ${this.getAddress()}`)
    }
    if (!isString(password)) {
      throw new Error(`Invalid password of type ${typeof password}`)
    }
    return EthereumjsWallet.fromV3(this.keystore, password, true)
  }

  encrypt(password: string): EthereumWalletKeystore {
    return new EthereumWalletKeystore(this.getEncryptedKeystore(password))
  }

  decrypt(password?: string): EthereumWalletKeystore {
    return new EthereumWalletKeystore(this.getDecryptedKeystore(password))
  }

  _signTx(tx: Transaction, { password }: { password?: string }) {
    return Promise.resolve().then(() => {
      const keystore = this.getDecryptedKeystore(password)
      const signedTx = new EthereumjsTx(tx.txData)
      signedTx.sign(keystore.getPrivateKey())
      return {
        signedTxData: this._signedEthJsTxToObject(signedTx),
      }
    })
  }

  getFileName(password?: string): string {
    return this.getDecryptedKeystore(password).getV3Filename()
  }

  getPrivateKeyString(password?: string): string {
    return this.getDecryptedKeystore(password).getPrivateKeyString()
  }

}

import RLP from 'rlp'
import EthereumjsTx from 'ethereumjs-tx'

import log from 'Utilities/log'
import { addHexPrefix } from 'Utilities/helpers'
import { mockHardwareWalletSign } from 'Actions/mock'

import EthereumWalletSigner from './EthereumWalletSigner'

const createAddressGetter = (derivationPath) => (index) =>
  window.faast.hw.ledger.getAddress_async(`${derivationPath}/${index}`)
    .then(({ address }) => address)

export default class EthereumWalletLedger extends EthereumWalletSigner {

  constructor(address, derivationPath, isMocking) {
    super('EthereumWalletLedger')
    this.address = address
    this.derivationPath = derivationPath // Expects full path to `address`
    this._isMocking = isMocking
  }

  static connect = (derivationPath = 'm/44\'/60\'/0\'') => {
    return window.faast.hw.ledger.getAppConfiguration_async()
      .then((data) => {
        log.info(`Ledger connected, version ${data.version}`)
        return {
          derivationPath,
          getAddress: createAddressGetter(derivationPath)
        }
      })
  }

  getAddress = () => this.address;

  signTx = (txParams) => {
    this._validateTx(txParams)
    if (this._isMocking) return mockHardwareWalletSign('ledger')
    let tx
    try {
      tx = new EthereumjsTx(txParams)
      tx.raw[6] = Buffer.from([txParams.chainId])
      tx.raw[7] = 0
      tx.raw[8] = 0
    } catch (e) {
      return Promise.reject(e)
    }

    return window.faast.hw.ledger.signTransaction_async(this.derivationPath, RLP.encode(tx.raw))
      .then((result) => {
        log.info('ledger wallet signed tx')
        return new EthereumjsTx(Object.assign({}, txParams, {
          r: addHexPrefix(result.r),
          s: addHexPrefix(result.s),
          v: addHexPrefix(result.v)
        })).serialize().toString('hex')
      })
      .fail((ex) => {
        if (ex === 'Invalid status 6a80') {
          throw new Error('Please enable "Contract data" in the Settings of the Ethereum Application and try again')
        } else if (ex === 'Invalid status 6985') {
          throw new Error('Transaction was denied')
        } else if (typeof ex === 'string') {
          throw new Error(`Error from Ledger Wallet - ${ex}`)
        } else if (ex.errorCode != null && ex.errorCode === 5) {
          throw new Error('Transaction timed out, please try again')
        }
      })
  };
}
  

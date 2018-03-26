import RLP from 'rlp'
import EthereumjsTx from 'ethereumjs-tx'

import log from 'Utilities/log'
import { addHexPrefix } from 'Utilities/helpers'

import EthereumWallet from './EthereumWallet'

const createAddressGetter = (derivationPath) => (index) =>
  window.faast.hw.ledger.getAddress_async(`${derivationPath}/${index}`)
    .then(({ address }) => address)

export default class EthereumWalletLedger extends EthereumWallet {

  static type = 'EthereumWalletLedger';

  constructor(address, derivationPath, isMocking) {
    super()
    this.address = address
    this.derivationPath = derivationPath // Expects full path to `address`
    this._isMocking = isMocking
  }

  getType = () => EthereumWalletLedger.type;

  getTypeLabel = () => 'Ledger Wallet';

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

  _signTxData = (txData) => Promise.resolve().then(() => {
    let tx
    try {
      tx = new EthereumjsTx(txData)
      tx.raw[6] = Buffer.from([txData.chainId])
      tx.raw[7] = 0
      tx.raw[8] = 0
    } catch (e) {
      return Promise.reject(e)
    }

    return window.faast.hw.ledger.signTransaction_async(this.derivationPath, RLP.encode(tx.raw))
      .then((result) => {
        log.info('ledger wallet signed tx', result)
        return this._signedEthJsTxToObject(new EthereumjsTx({
          ...txData,
          r: addHexPrefix(result.r),
          s: addHexPrefix(result.s),
          v: addHexPrefix(result.v)
        }))
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
  });
}
  

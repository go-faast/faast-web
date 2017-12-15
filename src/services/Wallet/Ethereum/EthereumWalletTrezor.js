import EthereumjsTx from 'ethereumjs-tx'

import log from 'Utilities/log'
import { stripHexPrefix, addHexPrefix } from 'Utilities/helpers'
import { toHex } from 'Utilities/convert'
import { mockHardwareWalletSign } from 'Actions/mock'

import EthereumWallet from './EthereumWallet'

export default class EthereumWalletTrezor extends EthereumWallet {

  constructor(derivationPath) {
    super()
    this.derivationPath = derivationPath
  }
  
  closeTrezorWindow = () => {
    if (window.faast.hw && window.faast.hw.trezor && window.faast.hw.trezor.close) window.faast.hw.trezor.close()
  };

  signTx = (txParams, isMocking) => {
    if (isMocking) return mockHardwareWalletSign('trezor')
    return new Promise((resolve, reject) => {
      window.faast.hw.trezor.closeAfterSuccess(false)
      window.faast.hw.trezor.signEthereumTx(
        this.derivationPath,
        stripHexPrefix(txParams.nonce),
        stripHexPrefix(txParams.gasPrice),
        stripHexPrefix(txParams.gasLimit),
        stripHexPrefix(txParams.to),
        stripHexPrefix(txParams.value),
        stripHexPrefix(txParams.data) || null,
        txParams.chainId,
        (response) => {
          if (response.success) {
            log.info('trezor signed tx')
            resolve(new EthereumjsTx(Object.assign({}, txParams, {
              r: addHexPrefix(response.r),
              s: addHexPrefix(response.s),
              v: toHex(response.v)
            })).serialize().toString('hex'))
          } else {
            if (response.error === 'Action cancelled by user') {
              reject(new Error('Transaction was denied'))
            } else {
              reject(new Error(`Error from Trezor - ${response.error}`))
            }
          }
        }
      )
    })
  };
}
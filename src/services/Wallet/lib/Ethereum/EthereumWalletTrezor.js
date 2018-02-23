import EthereumjsTx from 'ethereumjs-tx'
import EthereumJsUtil from 'ethereumjs-util'
import HDKey from 'hdkey'

import log from 'Utilities/log'
import { stripHexPrefix, addHexPrefix } from 'Utilities/helpers'
import { toHex } from 'Utilities/convert'
import { mockHardwareWalletSign } from 'Actions/mock'
import Trezor from 'Services/Trezor'

import EthereumWalletSigner from './EthereumWalletSigner'

export default class EthereumWalletTrezor extends EthereumWalletSigner {

  static type = 'EthereumWalletTrezor';

  constructor(address, derivationPath, isMocking) {
    super()
    this.address = address
    this.derivationPath = derivationPath // Expects full path to `address`
    this._isMocking = isMocking
  }

  getType = () => EthereumWalletTrezor.type;

  getTypeLabel = () => 'TREZOR';

  getIconUrl = () => 'https://faa.st/img/trezor-logo.png';

  static connect = (derivationPath = 'm/44\'/60\'/0\'/0') =>
    Trezor.getXPubKey(derivationPath)
      .then((result) => {
        log.info('Trezor xPubKey success')
        const hdKey = new HDKey()
        hdKey.publicKey = Buffer.from(result.publicKey, 'hex')
        hdKey.chainCode = Buffer.from(result.chainCode, 'hex')
        return {
          derivationPath,
          getAddress: (index) => {
            const derivedKey = hdKey.derive(`m/${index}`)
            const address = EthereumJsUtil.publicToAddress(derivedKey.publicKey, true).toString('hex')
            return Promise.resolve(`0x${address}`)
          }
        }
      });

  getAddress = () => this.address;

  signTx = (txParams) => {
    this._validateTx(txParams)
    if (this._isMocking) return mockHardwareWalletSign('trezor')
    Trezor.closeAfterSuccess(false)
    const { nonce, gasPrice, gasLimit, to, value, data, chainId } = txParams
    return Trezor.signEthereumTx(
      this.derivationPath,
      stripHexPrefix(nonce),
      stripHexPrefix(gasPrice),
      stripHexPrefix(gasLimit),
      stripHexPrefix(to),
      stripHexPrefix(value),
      stripHexPrefix(data) || null,
      chainId
    ).then(({ r, s, v }) => {
      log.info('trezor signed tx')
      return new EthereumjsTx({
        ...txParams,
        r: addHexPrefix(r),
        s: addHexPrefix(s),
        v: toHex(v)
      }).serialize().toString('hex')
    }).catch((e) => {
      if (e.message === 'Action cancelled by user') {
        throw new Error('Transaction was denied')
      } else {
        throw new Error(`Error from Trezor - ${e.message}`)
      }
    })
  };
}
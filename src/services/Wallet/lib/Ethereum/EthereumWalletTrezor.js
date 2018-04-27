import EthereumjsTx from 'ethereumjs-tx'
import EthereumJsUtil from 'ethereumjs-util'
import HDKey from 'hdkey'

import log from 'Utilities/log'
import { stripHexPrefix, addHexPrefix } from 'Utilities/helpers'
import { toHex } from 'Utilities/convert'
import Trezor from 'Services/Trezor'

import EthereumWallet from './EthereumWallet'

const createAccountGetter = (baseDerivationPath, hdKey) => (index) => {
  const derivedKey = hdKey.derive(`m/${index}`)
  const address = '0x' + EthereumJsUtil.publicToAddress(derivedKey.publicKey, true).toString('hex')
  const fullDerivationPath = `${baseDerivationPath}/${index}`
  return Promise.resolve(new EthereumWalletTrezor(address, fullDerivationPath))
}

export default class EthereumWalletTrezor extends EthereumWallet {

  static type = 'EthereumWalletTrezor';

  constructor(address, derivationPath) {
    super()
    this.address = address
    this.derivationPath = derivationPath // Expects full path to `address`
  }

  getType = () => EthereumWalletTrezor.type;

  getTypeLabel = () => 'TREZOR';

  static connect = (derivationPath = 'm/44\'/60\'/0\'/0') =>
    Trezor.getXPubKey(derivationPath)
      .then(({ publicKey, chainCode }) => {
        log.info('Trezor getXPubKey success')
        const hdKey = new HDKey()
        hdKey.publicKey = Buffer.from(publicKey, 'hex')
        hdKey.chainCode = Buffer.from(chainCode, 'hex')
        return createAccountGetter(derivationPath, hdKey)
      })
      .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount
        })))

  getAddress = () => this.address;

  _signTx = (tx) => Promise.resolve().then(() => {
    Trezor.closeAfterSuccess(false)
    const { txData } = tx
    const { nonce, gasPrice, gasLimit, to, value, data, chainId } = txData
    return Trezor.signEthereumTx(
      this.derivationPath,
      stripHexPrefix(nonce),
      stripHexPrefix(gasPrice),
      stripHexPrefix(gasLimit),
      stripHexPrefix(to),
      stripHexPrefix(value),
      stripHexPrefix(data) || null,
      chainId
    ).then((result) => {
      log.info('trezor signed tx', result)
      return {
        signedTxData: this._signedEthJsTxToObject(new EthereumjsTx({
          ...txData,
          r: addHexPrefix(result.r),
          s: addHexPrefix(result.s),
          v: toHex(result.v)
        }))
      }
    }).catch((e) => {
      if (e.message === 'Action cancelled by user') {
        throw new Error('Transaction was denied')
      } else {
        throw new Error(`Error from Trezor - ${e.message}`)
      }
    })
  });
}

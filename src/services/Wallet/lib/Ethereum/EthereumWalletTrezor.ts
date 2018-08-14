import EthereumjsTx from 'ethereumjs-tx'
import { pubToAddress } from 'ethereumjs-util'
import HDKey from 'hdkey'

import config from 'Config'
import log from 'Utilities/log'
import { stripHexPrefix, addHexPrefix } from 'Utilities/helpers'
import { toHex } from 'Utilities/convert'
import Trezor from 'Services/Trezor'

import EthereumWallet from './EthereumWallet'
import { ConnectResult } from '../types'
import { EthTransaction } from './types'

const typeLabel = config.walletTypes.trezor.name

const createAccountGetter = (baseDerivationPath: string, hdKey: HDKey) => (index: number) => {
  const derivedKey = hdKey.derive(`m/${index}`)
  const address = '0x' + (pubToAddress(derivedKey.publicKey, true) as Buffer).toString('hex')
  const fullDerivationPath = `${baseDerivationPath}/${index}`
  return Promise.resolve(new EthereumWalletTrezor(address, fullDerivationPath))
}

export default class EthereumWalletTrezor extends EthereumWallet {

  static type = 'EthereumWalletTrezor'

  /**
   * @param derivationPath - Full path to `address`
   */
  constructor(address: string, public derivationPath: string, label?: string) {
    super(address, label)
  }

  getType() { return EthereumWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static connect(derivationPath = 'm/44\'/60\'/0\'/0'): Promise<ConnectResult> {
    return Trezor.getXPubKey(derivationPath)
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
          getAccount,
        })))
  }

  _signTx(tx: EthTransaction, options: object): Promise<Partial<EthTransaction>> {
    return Promise.resolve().then(() => {
      Trezor.closeAfterSuccess(false)
      const { txData } = tx
      const { nonce, gasPrice, gas, to, value, data, chainId } = txData
      return Trezor.signEthereumTx(
        this.derivationPath,
        stripHexPrefix(nonce),
        stripHexPrefix(gasPrice),
        stripHexPrefix(gas),
        stripHexPrefix(to),
        stripHexPrefix(value),
        stripHexPrefix(data) || null,
        chainId,
      ).then((result) => {
        log.info('trezor signed tx', result)
        return {
          signedTxData: this._signedEthJsTxToObject(new EthereumjsTx({
            ...txData,
            r: addHexPrefix(result.r),
            s: addHexPrefix(result.s),
            v: toHex(result.v),
          })),
        }
      }).catch((e) => {
        if (e.message === 'Action cancelled by user') {
          throw new Error('Transaction was denied')
        } else {
          throw new Error(`Error from ${typeLabel} - ${e.message}`)
        }
      })
    })
  }
}

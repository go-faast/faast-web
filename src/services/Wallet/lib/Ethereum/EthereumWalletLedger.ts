import RLP from 'rlp'
import EthereumjsTx from 'ethereumjs-tx'

import config from 'Config'
import log from 'Utilities/log'
import { addHexPrefix } from 'Utilities/helpers'
import Ledger from 'Services/Ledger'

import EthereumWallet from './EthereumWallet'
import { EthTransaction } from './types'

const typeLabel = config.walletTypes.ledger.name

const createAccountGetter = (baseDerivationPath: string) => (index: number) => {
  const fullDerivationPath = `${baseDerivationPath}/${index}`
  return Ledger.eth.getAddress(fullDerivationPath)
    .then(({ address }) => new EthereumWalletLedger(address, fullDerivationPath))
}

export default class EthereumWalletLedger extends EthereumWallet {

  static type = 'EthereumWalletLedger';

  /**
   * @param derivationPath - full path to `address`
   */
  constructor(address: string, public derivationPath: string, label?: string) {
    super(address, label)
  }

  getType() { return EthereumWalletLedger.type }

  getTypeLabel() { return typeLabel }

  static connect = (derivationPath = 'm/44\'/60\'/0\'') => {
    return Ledger.eth.getAppConfiguration()
      .then((data) => {
        log.info(`Ledger connected, version ${data.version}`)
        return createAccountGetter(derivationPath)
      })
      .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount,
        })))
  }

  _signTx(tx: EthTransaction): Promise<Partial<EthTransaction>> {
    return Promise.resolve().then(() => {
      const { txData } = tx
      let ethJsTx
      ethJsTx = new EthereumjsTx(txData)
      ethJsTx.raw[6] = Buffer.from([txData.chainId])
      ethJsTx.raw[7] = 0
      ethJsTx.raw[8] = 0

      return Ledger.eth.signTransaction(this.derivationPath, RLP.encode(ethJsTx.raw))
        .then((result) => {
          log.debug('ledger wallet signed tx', result)
          return {
            signedTxData: this._signedEthJsTxToObject(new EthereumjsTx({
              ...txData,
              r: addHexPrefix(result.r),
              s: addHexPrefix(result.s),
              v: addHexPrefix(result.v),
            })),
          }
        })
        .catch((ex) => {
          log.error('Ledger.eth.signTransaction error', Object.assign({}, ex))
          const message = ex.message.toLowerCase()
          if (ex.statusCode === 0x6a80) {
            throw new Error('Please enable "Contract data" in the Settings of the Ethereum Application and try again')
          } else if (ex.statusCode === 0x6985) {
            throw new Error('Transaction was rejected')
          } else if (message.includes('u2f timeout')) {
            throw new Error('Took too long to sign transaction, please try again')
          }
          throw ex
        })
    })
  }
}

import { encode } from 'ripple-binary-codec'
import config from 'Config'
import log from 'Utilities/log'
import Ledger from 'Services/Ledger'

import RippleWallet from './RippleWallet'
import { XRPTransaction } from './types'

const typeLabel = config.walletTypes.ledger.name

const createAccountGetter = (baseDerivationPath: string) => (index: number) => {
  const fullDerivationPath = `${baseDerivationPath}/${index}`
  return getLedgerAddress(fullDerivationPath)
    .then(({ address }) => {
      return new RippleWalletLedger(address, fullDerivationPath)
    })
}

export const getLedgerAddress = (fullDerivationPath: string) => {
  return Ledger.xrp.getAddress(fullDerivationPath)
}

const getVersion = () => Ledger.xrp.getAppConfiguration()
.then((data) => {
  log.info(`Ledger XRP connected, version ${data.version}`, data)
  return data
})

export default class RippleWalletLedger extends RippleWallet {

  static type = 'RippleWalletLedger'

  /**
   * @param derivationPath - full path to `address`
   */
  constructor(address: string, public derivationPath: string, label?: string) {
    super(address, label)
  }

  getType() { return RippleWalletLedger.type }

  getTypeLabel() { return typeLabel }

  static connect = (derivationPath: string) => {
    return getVersion()
      .then(() => createAccountGetter(derivationPath))
      .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount,
        })))
  }

  async _signTx(tx: XRPTransaction): Promise<Partial<XRPTransaction>> {
    try {
      const { txData } = tx
      const { publicKey } = await getLedgerAddress(this.derivationPath)
      txData.txJSON.SigningPubKey = publicKey.toUpperCase()
      const signedTx = await Ledger.xrp.signTransaction(this.derivationPath, encode(txData.txJSON))
      txData.txJSON.TxnSignature = signedTx.toUpperCase()
      return {
        signedTxData: {
          signature: encode(txData.txJSON),
        },
        txData,
      }
    } catch (err) {
      if (err.toString().indexOf('0x6804') >= 0) {
        throw new Error('Please make sure your ledger wallet is unlocked and try again.')
      } else {
        throw new Error(`Unable to sign XRP transaction: ${err}`)
      }
    }
  }
}

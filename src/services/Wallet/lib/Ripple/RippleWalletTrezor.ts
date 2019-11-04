import config from 'Config'
import log from 'Utilities/log'
import Trezor from 'Services/Trezor'

import RippleWallet from './RippleWallet'
import { ConnectResult } from '../types'

import { XRPTransaction } from './types'

const typeLabel = config.walletTypes.trezor.name

const createAccountGetter = async (baseDerivationPath: string) => async (index: number) => {
  try {
    const fullDerivationPath = baseDerivationPath
    // const address = await Trezor.getRippleAddress(fullDerivationPath)
    const address = 'rBndiPPKs9k5rjBb7HsEiqXKrz8AfUnqWq'
    log.info('address:', address)
    return Promise.resolve(new RippleWalletTrezor(address, fullDerivationPath))
  } catch (err) {
    throw new Error(`Error getting XRP address: ${err}`)
  }
}

export default class RippleWalletTrezor extends RippleWallet {

  static type = 'RippleWalletTrezor'

  constructor(address: string, public derivationPath: string, label?: string) {
    super(address, label)
  }

  getType() { return RippleWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static connect(derivationPath: string): Promise<ConnectResult> {
    log.info('dp', derivationPath)
    return createAccountGetter(derivationPath)
    .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount,
        })))
  }

  async _signTx(tx: XRPTransaction, options: object): Promise<Partial<XRPTransaction>> {
    const { txData } = tx
    const txOptions = {
      fee: txData.instructions.fee,
      flags: txData.txJSON.Flags,
      sequence: txData.instructions.sequence,
      payment: {
        amount: tx.outputs[0].amount.toString(),
        destination: tx.outputs[0].address,
      },
    }
    const signedTx = await Trezor.signRippleTransaction(
      this.derivationPath,
      txOptions,
    )
    return {
      signedTxData: signedTx,
      txData,
    }
  }
}

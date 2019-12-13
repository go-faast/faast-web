import config from 'Config'
import log from 'Utilities/log'
import Trezor from 'Services/Trezor'
import RippleWallet from './RippleWallet'
import HDKey from 'hdkey'
import { toBigNumber } from 'Utilities/numbers'
import { encode, decode } from 'ripple-binary-codec'
import { deriveAddress } from 'ripple-keypairs'

import { ConnectResult } from '../types'
import { XRPTransaction } from './types'

const typeLabel = config.walletTypes.trezor.name

type Account = { publicKey: string, chainCode: string }

const createAccountGetter = (baseDerivationPath: string, account: Account) => (index: number) => {
    const fullDerivationPath = `${baseDerivationPath}/${index}`
    const publicKey = handleGetHDNodeXPub(account, 0)
    const address = getRippleAddress(publicKey)
    return Promise.resolve(new RippleWalletTrezor(address, account.publicKey, fullDerivationPath))
}

const handleGetHDNodeXPub = (account: Account, index: number = 0) => {
  const hdKey = new HDKey()
  hdKey.publicKey = Buffer.from(account.publicKey, 'hex')
  hdKey.chainCode = Buffer.from(account.chainCode, 'hex')
  const derivedKey = hdKey.derive(`m/${index}`)
  return derivedKey.publicKey.toString('hex')
}

export const getRippleAddress = (publicKey: string) => {
  console.log(publicKey)
  const address = deriveAddress(publicKey)
  console.log(address)
  return address
}

export const getRippleAccount = (fullDerivationPath: string) => {
  return Trezor.getXPubKey('xrp', fullDerivationPath)
}

export default class RippleWalletTrezor extends RippleWallet {

  static type = 'RippleWalletTrezor'

  constructor(address: string, public publicKey: string, public derivationPath: string, label?: string) {
    super(address, label)
  }

  getType() { return RippleWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static connect(derivationPath: string): Promise<ConnectResult> {
    log.info('dp', derivationPath)
    return getRippleAccount(derivationPath)
    .then((account) => {
      console.log(account)
      return createAccountGetter(derivationPath, account)
    })
    .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount,
        })))
  }

  async _signTx(tx: XRPTransaction, options: object): Promise<Partial<XRPTransaction>> {
    const { txData } = tx
    const feeInDrops = toBigNumber(txData.instructions.fee).times(1e6).toString()
    console.log('pubkey', this.publicKey)
    const txOptions = {
      fee: feeInDrops,
      flags: txData.txJSON.Flags,
      sequence: txData.instructions.sequence,
      payment: {
        amount: toBigNumber(tx.outputs[0].amount).times(1e6).toString(),
        destination: tx.outputs[0].address,
      },
    }
    console.log(txOptions)
    const signedTx = await Trezor.signRippleTransaction(
      this.derivationPath,
      txOptions,
    )
    console.log('signedTx', signedTx)
    // txOptions.SigningPubKey = this.publicKey.toUpperCase()
    txOptions.TxnSignature = signedTx.signature.toUpperCase()
    return {
      signedTxData: {
        signature: encode(txOptions),
      },
      txData,
    }
  }
}

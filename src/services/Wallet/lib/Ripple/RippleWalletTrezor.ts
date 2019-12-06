import config from 'Config'
import log from 'Utilities/log'
import Trezor from 'Services/Trezor'
import RippleWallet from './RippleWallet'
import HDKey from 'hdkey'
import { toBigNumber } from 'Utilities/numbers'
import { encode } from 'ripple-binary-codec'
import { deriveAddress } from 'ripple-keypairs'

import { ConnectResult } from '../types'
import { XRPTransaction } from './types'

const typeLabel = config.walletTypes.trezor.name

type Account = { publicKey: string, chainCode: string }

const createAccountGetter = (baseDerivationPath: string, account: Account) => (index: number) => {
    const fullDerivationPath = `${baseDerivationPath}/${index}`
    return Promise.resolve(new RippleWalletTrezor(account.publicKey, fullDerivationPath))
}

const handleGetHDNodeXPub = (account: Account, index: number) => {
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
  publicKey: string

  constructor(xpub: string, public derivationPath: string, label?: string) {
    super(getRippleAddress(handleGetHDNodeXPub()), label)
  }

  getType() { return RippleWalletTrezor.type }

  getTypeLabel() { return typeLabel }

  static connect(derivationPath: string): Promise<ConnectResult> {
    log.info('dp', derivationPath)
    return getRippleAccount(derivationPath)
    .then(({ publicKey, chainCode }) => {
      console.log(publicKey)
      return createAccountGetter(derivationPath, { publicKey, chainCode })
    })
    .then((getAccount) => getAccount(0)
        .then(() => ({
          derivationPath,
          getAccount,
        })))
  }

  async _signTx(tx: XRPTransaction, options: object): Promise<Partial<XRPTransaction>> {
    const { txData } = tx
    // const { publicKey } = await getRipplePublicKey(this.derivationPath)
    txData.txJSON.SigningPubKey = this.publicKey.toUpperCase()
    const feeInDrops = toBigNumber(txData.instructions.fee).times(1000000).toString()
    const txOptions = {
      fee: feeInDrops,
      flags: txData.txJSON.Flags,
      sequence: txData.instructions.sequence,
      payment: {
        amount: toBigNumber(tx.outputs[0].amount).times(1000000).toString(),
        destination: tx.outputs[0].address,
      },
    }
    console.log(txOptions)
    const signedTx = await Trezor.signRippleTransaction(
      this.derivationPath,
      txOptions,
    )
    txData.txJSON.TxnSignature = signedTx.signature.toUpperCase()
    return {
      signedTxData: {
        signature: encode(txData.txJSON),
      },
      txData,
    }
  }
}

import log from 'Utilities/log'
import { decode } from 'ripple-binary-codec'
import { difference } from 'lodash'
import { ellipsize } from 'Utilities/display'
import { toBigNumber } from 'Utilities/numbers'

import RippleLib from 'Services/RippleLib'
import { Amount, Transaction, Receipt } from '../types'

import Wallet from '../Wallet'

import { Asset } from 'Types'
import { XRPTransaction, SignedTxData, TxData, FormattedSubmitResponse } from './types'

const DEFAULT_MAX_LEDGER_VERSION_OFFSET = 100

export default abstract class RippleWallet extends Wallet {

  static type = 'RippleWallet'

  constructor(public address: string, label?: string) {
    super(address, label)
  }

  getLabel() {
    return this.label || `${ellipsize(this.getAddress(), 6, 4)}`
  }

  getAddress() { return this.address }

  isSingleAddress() { return true }

  _getUsedAddresses() { return Promise.resolve([this.getAddress()]) }

  _isAggregateTransactionSupported() { return false }

  _createAggregateTransaction(): never {
    throw new Error('Ripple wallet does not support aggregate transactions')
  }

  _getFreshAddress(asset: Asset): Promise<string> {
    return Promise.resolve(this.getAddress())
  }

  _isAssetSupported(asset: Asset) {
    return asset && (asset.symbol === 'XRP')
  }

  async _getBalance(): Promise<Amount> {
    const address = this.getAddress()
    try {
      const rippleLib = await RippleLib()
      const balances = await rippleLib.getBalances(address)
      const xrpBalance = balances[0].value
      return toBigNumber(xrpBalance)
    } catch (err) {
      throw new Error(`Error getting XRP Balance for address, ${address}: ${err}`)
    }
  }

  async _createTransaction(address: string, amount: Amount, asset: Asset, options?: {
    extraId?: string,
  }): Promise<XRPTransaction> {
    const extraId = parseInt(options.extraId)
    const xrpAddress = this.getAddress()
    const paymentOptions = {
      source: {
        address: xrpAddress,
        maxAmount: {
          value: amount.toString(),
          currency: 'XRP',
        },
      },
      destination: {
        address,
        tag: extraId,
        amount: {
          value: amount.toString(),
          currency: 'XRP',
        },
      },
    }

    try {
      const rippleLib = await RippleLib()
      const payment = await rippleLib.preparePayment(xrpAddress, paymentOptions, {
        fee: await this._getDefaultFeeRate(),
        maxLedgerVersionOffset: DEFAULT_MAX_LEDGER_VERSION_OFFSET,
      })
      const tx = {
        ...this._newTransaction(asset, [{ address, amount }]),
        feeAmount: toBigNumber(payment.instructions.fee),
        feeSymbol: 'XRP',
        txData: {
          ...payment,
          txJSON: JSON.parse(payment.txJSON),
        },
      }
      return tx
    } catch (err) {
      throw new Error(`Error creating XRP transaction: ${err}`)
    }
  }

  async _getDefaultFeeRate(): Promise<any> {
    try {
      const rippleLib = await RippleLib()
      const fee = await rippleLib.getFee()
      return fee
    } catch (err) {
      throw new Error(`Error XRP transaction fee: ${err}`)
    }
  }

  _getTransactionReceipt(): Promise<Receipt> {
    return
  }

  async _validateSignedTxData(signedTxData: SignedTxData): Promise<SignedTxData> {
    if (signedTxData === null || typeof signedTxData !== 'object') {
      log.error('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${RippleWallet.type} signedTxData of type ${typeof signedTxData}`)
    }
    const decodedTx = decode(signedTxData.signature)
    const requiredProps = ['Account', 'Amount', 'Destination', 'DestinationTag', 'Fee', 'Flags',
    'LastLedgerSequence', 'Sequence', 'SigningPubKey', 'TransactionType', 'TxnSignature']
    const missingProps = difference(requiredProps, Object.keys(decodedTx))
    if (missingProps.length > 0) {
      log.debug('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${RippleWallet.type} txData - missing required props ${missingProps}`)
    } else {
      log.debug('Validation passed')
    }

    return signedTxData
  }

  _validateTxData(txData: TxData): TxData {
    if (txData === null || typeof txData !== 'object') {
      log.error('invalid txData', txData)
      throw new Error(`Invalid ${RippleWallet.type} txData of type ${typeof txData}`)
    }
    const requiredProps = ['txJSON', 'instructions']
    const missingProps = difference(requiredProps, Object.keys(txData))
    if (missingProps.length > 0) {
      log.debug('invalid txData', txData)
      throw new Error(`Invalid ${RippleWallet.type} txData - missing required props ${missingProps}`)
    }
    return txData
  }

  async _sendSignedTx(tx: XRPTransaction, options: object): Promise<Partial<Transaction>> {
    try {
      const rippleLib = await RippleLib()
      const transaction: any = await rippleLib.submit(tx.signedTxData.signature)
      log.info('send tx', transaction)
      return { hash: transaction.tx_json.hash }
    } catch (err) {
      throw new Error(`Error sending XRP transaction: ${err}`)
    }
  }
}

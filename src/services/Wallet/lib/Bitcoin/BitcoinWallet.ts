import log from 'Utilities/log'
import { toHashId } from 'Utilities/helpers'
import { toMainDenomination, toSmallestDenomination } from 'Utilities/convert'
import { ellipsize } from 'Utilities/display'
import { fetchGet } from 'Utilities/fetch'
import { getNetwork, Bitcore, AccountInfo } from 'Services/Bitcore'

import Wallet from '../Wallet'

import { Asset } from 'Types'
import { TransactionOutput, Transaction, Amount, FeeRate, Receipt } from '../types'

const DEFAULT_FEE_PER_BYTE = 10

export default abstract class BitcoinWallet extends Wallet {

  static type = 'BitcoinWallet'

  assetSymbol = 'BTC'
  _bitcore: Bitcore
  _latestDiscoveryResult: object

  constructor(public xpub: string, label?: string) {
    super(toHashId(xpub), label)
    this._bitcore = getNetwork(this.assetSymbol)
    this._latestDiscoveryResult = null
  }

  abstract isLegacyAccount(): boolean

  getLabel() { return this.label || `Bitcoin ${ellipsize(this.xpub, 8, 4)}` }

  isSingleAddress() { return false }

  _isAssetSupported(asset: Asset) {
    return asset && asset.symbol === this.assetSymbol
  }

  _isAggregateTransactionSupported(asset: Asset) {
    return this._isAssetSupported(asset)
  }

  _performDiscovery() {
    const discoveryPromise = this._bitcore.discoverAccount(this.xpub)
      .then((result) => {
        log.debug(`bitcore result for ${this.assetSymbol}`, result)
        this._latestDiscoveryResult = result
        return result
      });
    this._latestDiscoveryResult = discoveryPromise
    return discoveryPromise
  }

  _getDiscoveryResult(): AccountInfo {
    return Promise.resolve(this._latestDiscoveryResult)
      .then((result) => {
        if (!result) {
          return this._performDiscovery()
        }
        return result
      })
  }

  _getFreshAddress(asset: Asset, { index = 0 }) {
    return Promise.resolve()
      .then(() => this._getDiscoveryResult())
      .then(({ unusedAddresses }) => unusedAddresses[index])
      .catch((e) => {
        throw new Error(`Failed to get fresh bitcoin address: ${e.message}`)
      })
  }

  _getDefaultFeeRate(
    asset: Asset,
    { level = 'medium' }: { level?: 'high' | 'medium' | 'low' } = {},
  ): Promise<FeeRate> {
    return fetchGet('https://api.blockcypher.com/v1/btc/main')
      .then((result) => {
        const feePerKb = result[`${level}_fee_per_kb`] || (DEFAULT_FEE_PER_BYTE * 1000)
        return feePerKb / 1000
      })
      .catch((e) => {
        log.error('Failed to get bitcoin dynamic fee, using default', e)
        return DEFAULT_FEE_PER_BYTE
      })
      .then((feePerByte) => ({
        rate: feePerByte,
        unit: 'sat/byte',
      }))
  }

  _createAggregateTransaction(
    outputs: TransactionOutput[],
    asset: Asset,
    { feeRate: feeRateOption }: { feeRate?: number },
  ): Promise<Partial<Transaction>> {
    return Promise.all([
      this._getDiscoveryResult(),
      feeRateOption || this._getDefaultFeeRate(asset).then(({ rate }) => rate),
    ]).then(([discoverResult, feeRate]) => {
      const isSegwit = !this.isLegacyAccount()
      const convertedOutputs = outputs.map(({ address, amount }) => ({
        address,
        amount: toSmallestDenomination(amount, asset.decimals).toNumber(),
      }))
      return this._bitcore.buildPaymentTx(discoverResult, convertedOutputs, feeRate, isSegwit)
    })
    .then((txData) => {
      return {
        feeAmount: toMainDenomination(txData.fee, asset.decimals),
        feeSymbol: 'BTC',
        // buildPaymentTx can adjust output amounts in some situations
        outputs: txData.outputs.map(({ address, amount }) => ({
          address,
          amount: toMainDenomination(amount, asset.decimals),
        })),
        txData,
      }
    })
  }

  _createTransaction(
    address: string,
    amount: Amount,
    asset: Asset,
    options: object,
  ): Promise<Partial<Transaction>> {
    return this._createAggregateTransaction([{ address, amount }], asset, options)
  }

  _getBalance(asset: Asset): Promise<Amount> {
    return this._performDiscovery()
      .then(({ balance }) => toMainDenomination(balance, asset.decimals))
  }

  _getTransactionReceipt({ hash }: Transaction): Promise<Receipt> {
    return this._bitcore.lookupTransaction(hash)
      .then((result) => !result ? null : ({
        confirmed: result.height > 0,
        succeeded: result.height > 0,
        blockNumber: result.height,
        raw: result,
      }))
  }

  _sendSignedTx({ signedTxData }: Transaction): Promise<Partial<Transaction>> {
    return this._bitcore.sendTransaction(signedTxData)
      .then((txHash) => {
        this._latestDiscoveryResult = null // Clear discovery cache to avoid double spending utxos
        return {
          hash: txHash,
        }
      })
  }

  _validateTxData(txData: any): any {
    if (txData === null || typeof txData !== 'object') {
      throw new Error(`Invalid ${this.getType()} txData of type ${typeof txData}`)
    }
    return txData
  }

  _validateSignedTxData(signedTxData: any): any {
    if (typeof signedTxData !== 'string') {
      throw new Error(`Invalid ${this.getType()} signedTxData of type ${typeof signedTxData}`)
    }
    return signedTxData
  }

}

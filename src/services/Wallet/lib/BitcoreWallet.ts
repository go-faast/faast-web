import log from 'Utilities/log'
import { toHashId } from 'Utilities/helpers'
import { toMainDenomination, toSmallestDenomination, toNumber } from 'Utilities/convert'
import { ellipsize } from 'Utilities/display'
import { fetchGet } from 'Utilities/fetch'
import { getBitcore, Bitcore, AccountInfo } from 'Services/Bitcore'
import { deriveAddress, getNetworkConfig } from 'Utilities/bitcoin'
import { NetworkConfig } from 'Utilities/networks'
import toastr from 'Utilities/toastrWrapper'

import Wallet from './Wallet'

import { Asset } from 'Types'
import { TransactionOutput, Transaction, BitcoreTransaction, Amount, FeeRate, Receipt } from './types'

const ID_DERIVATION_PATH = [26, 5, 172, 179] // Arbitrary bip32 path used to identify an HD wallet
const DEFAULT_FEE_PER_BYTE = 10

export default abstract class BitcoreWallet extends Wallet {

  static type = 'BitcoreWallet'

  assetSymbol: string
  _network: NetworkConfig
  _bitcore: Bitcore
  _latestDiscoveryResult: AccountInfo

  constructor(network: NetworkConfig, public xpub: string, public derivationPath: string, label?: string) {
    super(deriveAddress(xpub, ID_DERIVATION_PATH, network), label)
    this.assetSymbol = network.symbol
    this._network = network
    this._bitcore = getBitcore(network.symbol)
    this._latestDiscoveryResult = null
  }

  isLegacyAccount() { return this.derivationPath.startsWith('m/44') }

  getAccountNumber() { return Number.parseInt(this.derivationPath.match(/(\d+)'$/)[1]) + 1 }

  getLabel() { return this.label || `${this._network.name} ${ellipsize(this.xpub, 8, 4)}` }

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

  _getDiscoveryResult(): Promise<AccountInfo> {
    return Promise.resolve(this._latestDiscoveryResult)
      .then((result) => {
        if (!result) {
          return this._performDiscovery()
        }
        return result
      })
  }

  getUsedAddresses() {
    return this._getDiscoveryResult()
      .then((result) => result.usedAddresses.map(({ address }: { address: string }) => address))
  }

  _getFreshAddress(asset: Asset, { index = 0 }) {
    return Promise.resolve()
      .then(() => this._getDiscoveryResult())
      .then(({ unusedAddresses }) => unusedAddresses[index])
      .catch((e) => {
        toastr.error(`Failed to get ${asset.symbol} address from wallet. Please try refreshing page.`)
        throw new Error(`Failed to get fresh ${asset.symbol} address: ${e.message || e}`)
      })
  }

  _getDefaultFeeRate(
    asset: Asset,
  ): Promise<FeeRate> {
    return Promise.resolve({
      rate: DEFAULT_FEE_PER_BYTE,
      unit: 'sat/byte',
    })
  }

  _createAggregateTransaction(
    outputs: TransactionOutput[],
    asset: Asset,
    { feeRate: feeRateOption }: { feeRate?: number },
  ): Promise<BitcoreTransaction> {
    return Promise.all([
      this._getDiscoveryResult(),
      feeRateOption || this._getDefaultFeeRate(asset).then(({ rate }) => toNumber(rate)),
    ]).then(([discoverResult, feeRate]) => {
      const isSegwit = !this.isLegacyAccount()
      const convertedOutputs = outputs.map(({ address, amount }) => ({
        address,
        amount: toSmallestDenomination(amount, asset.decimals).toNumber(),
      }))
      return this._bitcore.buildPaymentTx(discoverResult, convertedOutputs, feeRate, isSegwit)
    })
    .then((txData) => {
      // buildPaymentTx can adjust output amounts in some situations
      const newOutputs = txData.outputs.map(({ address, amount }) => ({
        address,
        amount: toMainDenomination(amount, asset.decimals),
      }))
      return {
        ...this._newTransaction(asset, newOutputs),
        feeAmount: toMainDenomination(txData.fee, asset.decimals),
        feeSymbol: asset.symbol,
        txData,
      }
    })
  }

  _createTransaction(
    address: string,
    amount: Amount,
    asset: Asset,
    options: object,
  ): Promise<BitcoreTransaction> {
    return this._createAggregateTransaction([{ address, amount }], asset, options)
  }

  _getBalance(asset: Asset): Promise<Amount> {
    return this._performDiscovery()
      .then(({ balance }) => toMainDenomination(balance, asset.decimals))
  }

  _getTransactionReceipt({ hash }: BitcoreTransaction): Promise<Receipt> {
    return this._bitcore.lookupTransaction(hash)
      .then((result) => !result ? null : ({
        confirmed: result.height > 0,
        succeeded: result.height > 0,
        blockNumber: result.height,
        raw: result,
      }))
  }

  _sendSignedTx({ signedTxData }: BitcoreTransaction): Promise<Partial<BitcoreTransaction>> {
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

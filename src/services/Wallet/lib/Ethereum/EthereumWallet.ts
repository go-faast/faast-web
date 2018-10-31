import { difference } from 'lodash'
import EthJsTx from 'ethereumjs-tx'

import config from 'Config'
import { getWeb3 } from 'Services/Web3'
import { addHexPrefix, toHashId } from 'Utilities/helpers'
import {
  ZERO, BigNumber, Numerical, toBigNumber, toSmallestDenomination, toMainDenomination, toHex, toTxFee, toNumber,
} from 'Utilities/convert'
import { ellipsize } from 'Utilities/display'
import log from 'Utilities/log'

import { batchRequest, tokenBalanceData, tokenSendData, web3SendTx, toUniversalReceipt } from './util'
import Wallet from '../Wallet'
import { EthTransaction, TxData, SignedTxData, GetBalanceOptions } from './types'
import { Asset } from 'Types'
import { Amount, Balances, Transaction, Receipt } from '../types'

const DEFAULT_GAS_PRICE = 21e9 // 21 Gwei
const DEFAULT_GAS_LIMIT_ETH = toBigNumber(21000)
const DEFAULT_GAS_LIMIT_TOKEN = toBigNumber(100000)

/**
 * Batch size used when loaded token balances. Anything greater than 646 will exceed the
 * maximum request body size of 128KiB and cause the request to fail.
 */
const GET_BALANCES_BATCH_SIZE = 500

function estimateGasLimit(txData: Partial<TxData>): Promise<BigNumber> {
  log.debug('estimateGasLimit', txData)
  const errorFallback = (e: any) => {
    log.warn('Error calling web3.eth.estimateGas, falling back to fixed limits', e)
    return Promise.resolve(txData.data ? DEFAULT_GAS_LIMIT_TOKEN : DEFAULT_GAS_LIMIT_ETH)
  }
  try {
    return getWeb3().eth.estimateGas(txData)
      .then(toBigNumber)
      .catch(errorFallback)
  } catch (e) {
    return errorFallback(e)
  }
}

export default abstract class EthereumWallet extends Wallet {

  static type = 'EthereumWallet';

  constructor(public address: string, label?: string) {
    super(address.toLowerCase(), label)
  }

  getLabel() { return this.label || `Ethereum ${ellipsize(this.getAddress(), 6, 4)}` }

  getAddress() { return this.address }

  isSingleAddress() { return true }

  _getUsedAddresses() { return Promise.resolve([this.getAddress()]) }

  _isAggregateTransactionSupported() { return false }

  _createAggregateTransaction(): never {
    throw new Error('Ethereum wallet does not support aggregate transactions')
  }

  _getFreshAddress(asset: Asset): Promise<string> {
    return Promise.resolve(this.getAddress())
  }

  _isAssetSupported(asset: Asset) {
    return asset && (asset.symbol === 'ETH' || asset.ERC20)
  }

  _getDefaultFeeRate() {
    return getWeb3().eth.getGasPrice()
      .catch((e) => {
        log.error(`Failed to get ethereum dynamic fee, using default of ${DEFAULT_GAS_PRICE} wei`, e)
        return DEFAULT_GAS_PRICE
      })
      .then((gasPrice) => ({
        rate: gasPrice,
        unit: 'wei/gas',
      }))
  }

  _getBalance(asset: Asset, { web3Batch = null }: GetBalanceOptions): Promise<Amount> {
    const web3 = getWeb3()
    const address = this.getAddress()
    let request: Promise<Numerical>
    if (asset.symbol === 'ETH') {
      request = batchRequest(web3Batch, web3.eth.getBalance, address, 'latest')
    } else { // Handle ERC20
      request = batchRequest(web3Batch, web3.eth.call, {
        to: asset.contractAddress,
        data: tokenBalanceData(address),
      }, 'latest')
    }
    return request.then((balance) => toMainDenomination(balance, asset.decimals))
  }

  getAllBalances(): Promise<Balances> {
    const web3 = getWeb3()
    return Promise.resolve(this.getSupportedAssets())
      .then((assets) => {
        const batches: any[] = []
        const balanceRequests = assets.map((asset, i) => {
          const batchNumber = Math.floor(i / GET_BALANCES_BATCH_SIZE)
          let batch = batches[batchNumber]
          if (!batch) {
            batch = new web3.BatchRequest()
            batches[batchNumber] = batch
          }
          return this._getBalance(asset, { web3Batch: batch })
            .then((balance) => ({ symbol: asset.symbol, balance }))
        })
        batches.forEach((batch) => batch.execute())
        return Promise.all(balanceRequests)
      }).then((balances) => balances.reduce(
        (result, { symbol, balance }) => (balance.gt(ZERO) || symbol === 'ETH')
          ? ({ ...result, [symbol]: balance })
          : result,
        {}))
  }

  _createTransaction(address: string, amount: Amount, asset: Asset, options?: {
    previousTx?: EthTransaction,
    nonce?: number,
    gasPrice?: Numerical,
    gasLimit?: Numerical,
    gas?: Numerical, // Alias for gasLimit
  }): Promise<EthTransaction> {
    return Promise.resolve().then(() => {
      const web3 = getWeb3()
      log.debug(`Creating transaction sending ${amount} ${asset.symbol} from ${this.getAddress()} to ${address}`)
      const txData = {
        chainId: config.ethereumChainId,
        from: this.getAddress(),
        value: toHex(ZERO),
        data: '',
        to: '',
      }
      if (asset.symbol === 'ETH') {
        txData.to = address
        txData.value = toHex(toSmallestDenomination(amount, asset.decimals))
      } else if (asset.ERC20) {
        // Handle ERC20
        txData.to = asset.contractAddress,
        txData.data = tokenSendData(address, amount, asset.decimals)
      } else {
        throw new Error(`Unsupported asset ${asset.symbol || asset} provided to EthereumWallet.createTransaction`)
      }

      const { previousTx } = options
      let customNonce = options.nonce
      if (typeof customNonce === 'undefined'
        && previousTx
        && previousTx.txData.from.toLowerCase() === txData.from.toLowerCase()) {
        customNonce = toNumber(previousTx.txData.nonce) + 1
      }

      const customGasPrice = options.gasPrice
      const customGasLimit = options.gasLimit || options.gas

      const opts: Array<Numerical | Promise<Numerical>> = [
        customGasPrice || this._getDefaultFeeRate().then(({ rate }) => rate),
        customGasLimit || estimateGasLimit(txData),
        customNonce || web3.eth.getTransactionCount(txData.from),
      ]
      return Promise.all(opts).then(([gasPrice, gasLimit, nonce]) => ({
        ...this._newTransaction(asset, [{ address, amount }]),
        feeAmount: toTxFee(gasLimit, gasPrice),
        feeSymbol: 'ETH',
        txData: {
          ...txData,
          gasPrice: toHex(gasPrice),
          gas: toHex(gasLimit),
          nonce: toHex(nonce),
        },
      }))
    })
  }

  _getTransactionReceipt(tx: EthTransaction): Promise<Receipt> {
    return getWeb3().eth.getTransactionReceipt(tx.hash)
      .then(toUniversalReceipt)
  }

  _sendSignedTx(tx: EthTransaction, options: object): Promise<Partial<EthTransaction>> {
    return web3SendTx(getWeb3(), tx.signedTxData.raw, options)
      .then((hash) => ({ hash }))
  }

  _validateTxData(txData: TxData): TxData {
    if (txData === null || typeof txData !== 'object') {
      log.error('invalid txData', txData)
      throw new Error(`Invalid ${EthereumWallet.type} txData of type ${typeof txData}`)
    }
    const requiredProps = ['data', 'from', 'gas', 'gasPrice', 'nonce', 'to', 'value', 'chainId']
    const missingProps = difference(requiredProps, Object.keys(txData))
    if (missingProps.length > 0) {
      log.debug('invalid txData', txData)
      throw new Error(`Invalid ${EthereumWallet.type} txData - missing required props ${missingProps}`)
    }
    return txData
  }

  _validateSignedTxData(signedTxData: SignedTxData): SignedTxData {
    if (signedTxData === null || typeof signedTxData !== 'object') {
      log.error('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData of type ${typeof signedTxData}`)
    }
    const { raw } = signedTxData
    if (typeof raw !== 'string') {
      log.error('invalid signedTxData', signedTxData)
      throw new Error(`Invalid ${EthereumWallet.type} signedTxData - invalid prop "raw" of type ${typeof raw}`)
    }
    return signedTxData
  }

  _signedEthJsTxToObject(ethJsTx: EthJsTx): SignedTxData {
    const validationError = ethJsTx.validate(true)
    if (validationError) {
      throw new Error(validationError)
    }
    return {
      raw: addHexPrefix(ethJsTx.serialize().toString('hex')),
      tx: ethJsTx,
    }
  }

}

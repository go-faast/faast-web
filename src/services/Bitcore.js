import { networks } from 'bitcoinjs-lib-zcash'
import { WorkerDiscovery, BitcoreBlockchain } from 'hd-wallet'
import { TransactionBuilder } from 'bitcoinjs-lib'
import BigNumber from 'bignumber.js'
import { isString, omit } from 'lodash'

import xpubWasmFile from 'hd-wallet/lib/fastxpub/fastxpub.wasm?file'

import XpubWorker from 'hd-wallet/lib/fastxpub/fastxpub?worker'
import SocketWorker from 'hd-wallet/lib/socketio-worker/inside?worker'
import DiscoveryWorker from 'hd-wallet/lib/discovery/worker/inside?worker'

import log from 'Utilities/log'
import { ypubToXpub, estimateTxFee } from 'Utilities/bitcoin'

// setting up workers
const xpubWorker = new XpubWorker()
const xpubWasmFilePromise = fetch(xpubWasmFile)
    .then(response => response.ok ? response.arrayBuffer() : Promise.reject('failed to load'))

const socketWorkerFactory = () => new SocketWorker()
const discoveryWorkerFactory = () => new DiscoveryWorker()

/**
 * Sort the utxos for input selection
 * 
 * Each utxo object requires at least 2 fields, value (satoshis) and confirmations.
 */
function sortUtxos(utxoList) {
  const matureList = []
  const immatureList = []
  utxoList.forEach((utxo) => {
    if (utxo.confirmations >= 6) {
      matureList.push(utxo)
    } else {
      immatureList.push(utxo)
    }
  })
  matureList.sort((a, b) => a.value - b.value) // Ascending order by value
  immatureList.sort((a, b) => b.confirmations - a.confirmations) // Descending order by confirmations
  return matureList.concat(immatureList)
}

class Bitcore extends BitcoreBlockchain {
  constructor(assetSymbol, networkConfig, bitcoreUrls) {
    super(bitcoreUrls, socketWorkerFactory)
    this.assetSymbol = assetSymbol
    this.network = networkConfig
    this.discovery = new WorkerDiscovery(discoveryWorkerFactory, xpubWorker, xpubWasmFilePromise, this)
  }

  toJSON() {
    return {
      ...this,
      discovery: omit(this.discovery, 'chain') // Avoid circular reference
    }
  }

  /**
   * Discover the balance, transactions, unused addresses, etc of an xpub.
   *
   * @param {String} xpub - The xpub or ypub to discover
   * @param {Function} [onUpdate] - Callback for partial updates to discover result
   * @returns {Object}
   */
  discoverAccount(xpub, onUpdate) {
    return Promise.resolve()
      .then(() => {
        let segwit = 'off'
        if (xpub.startsWith('ypub')) {
          segwit = 'p2sh'
          xpub = ypubToXpub(xpub)
        }
        const process = this.discovery.discoverAccount(null, xpub, this.network, segwit)
        if (onUpdate) {
          process.stream.values.attach(onUpdate)
        }
        return process.ending.then((result) => ({
          ...result,
          utxos: result.utxos.map((utxo) => ({
            ...utxo,
            confirmations: utxo.height ? result.lastBlock.height - utxo.height : 0
          }))
        }))
      })
  }

  /**
  * Build a simple payment transaction.
  * Note: fee will be subtracted from amount when attempting to send entire account balance
  *
  * @param {(String|Object)} account - An xpub to pass to discoverAccount or the result of calling discoverAccount
  * @param {String} toAddress - address to send to
  * @param {Number} amount - amount to send (unit: satoshi)
  * @param {Number} feeRate - desired fee (unit: satoshi per byte)
  * @param {Boolean} [isSegwit=true] - True if this is a segwit transaction
  * @param {Number} [dustThreshold=546] - A change output will only be included when greater than this value.
  *   Otherwise it will be included as a fee instead (unit: satoshi)
  * @returns {Object}
  */
  buildPaymentTx(account, toAddress, amount, feeRate, isSegwit = true, dustThreshold = 546) {
    let discoverResult = account
    if (isString(account)) {
      discoverResult = this.discoverAccount(account)
    }
    const { utxos, changeIndex, changeAddresses } = discoverResult
    const changeAddress = changeAddresses[changeIndex]
    amount = new BigNumber(amount)
    const sortedUtxos = sortUtxos(utxos)

    /* Select inputs and calculate appropriate fee */
    let fee = new BigNumber(0) // Total fee is recalculated when adding each input
    let amountWithFee = amount.plus(fee)
    let inputUtxos = []
    let inputTotal = new BigNumber(0)
    for (let i = 0; i < sortedUtxos.length; i++) {
      fee = new BigNumber(estimateTxFee(feeRate, inputUtxos.length + 1, 2, isSegwit))
      amountWithFee = amount.plus(fee)
      let utxo = sortedUtxos[i]
      inputTotal = inputTotal.plus(utxo.value)
      inputUtxos.push(utxo)
      if (inputTotal.gte(amountWithFee)) break
    }
    if (amountWithFee.gt(inputTotal)) {
      const amountWithSymbol = `${amount.times(1e-8)} ${this.assetSymbol}`
      if (amount.eq(inputTotal)) {
        log.debug(`Attempting to send entire ${amountWithSymbol} balance. Subtracting fee of ${feeRate} sat/byte from amount instead of adding it.`)
        amountWithFee = amount
        amount = amount.minus(fee)
      } else {
        throw new Error(`You do not have enough UTXOs to send ${amountWithSymbol} with ${feeRate} sat/byte fee`)
      }
    }

    /* Build outputs */
    const change = inputTotal.minus(amountWithFee)
    const outputs = [{
      address: toAddress,
      value: amount.toNumber()
    }]
    if (change.gt(dustThreshold)) {
      // Avoid creating dust outputs
      outputs.push({
        address: changeAddress,
        value: change.toNumber()
      })
    }
    const outputBuilder = new TransactionBuilder(this.network)
    outputs.forEach(({ value, address }) => outputBuilder.addOutput(address, value))
    const outputScript = outputBuilder.buildIncomplete().toHex().slice(10, -8) // required by ledgerjs api

    return {
      inputUtxos,
      outputs,
      outputScript,
      toAddress,
      amount: amount.toNumber(),
      fee: fee.toNumber(),
      inputTotal: inputTotal.toNumber(),
      change: change.toNumber(),
      changePath: [1, changeIndex],
      changeAddress,
      isSegwit,
    }

  }
}

const assetToBitcore = {
  BTC: new Bitcore('BTC', networks.bitcoin, ['https://blockexplorer.com', 'https://bitcore1.trezor.io', 'https://bitcore3.trezor.io']),
  LTC: new Bitcore('LTC', networks.litecoin, ['https://ltc-bitcore3.trezor.io']),
}

/** Get the Bitcore service for the specified asset */
function getNetwork (assetSymbol) {
  const bitcore = assetToBitcore[assetSymbol]
  if (!bitcore) {
    throw new Error(`Asset ${assetSymbol} has no Bitcore configuration`)
  }
  return bitcore
}

const wrapBitcoreFn = (fnName) => (assetSymbol, ...args) => getNetwork(assetSymbol)
  .then((bitcore) => bitcore[fnName](...args))

export default {
  getNetwork,
  discoverAccount: wrapBitcoreFn('discoverAccount'),
  lookupTransaction: wrapBitcoreFn('lookupTransaction'),
  buildPaymentTx: wrapBitcoreFn('buildPaymentTx'),
}

import { networks } from 'bitcoinjs-lib-zcash'
import { WorkerDiscovery, BitcoreBlockchain } from 'hd-wallet'
import { TransactionBuilder } from 'bitcoinjs-lib'
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
    .then(response => response.ok ? response.arrayBuffer() : Promise.reject('failed to load fastxpub.wasm'))

const socketWorkerFactory = () => new SocketWorker()
const discoveryWorkerFactory = () => new DiscoveryWorker()

/**
 * Sort the utxos for input selection
 * 
 * @param {Object[]} utxoList
 * @param {Number} utxoList[].value
 * @param {Number} utxoList[].confirmations
 * @returns {Object[]}
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
   * @returns {Promise<Object>}
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
  * Note: fee will be subtracted from first output when attempting to send entire account balance
  *
  * @param {Object} account - The result of calling discoverAccount
  * @param {Number} account.changeIndex - The index of the next unused changeAddress
  * @param {String[]} account.changeAddresses - An array of all change addresses
  * @param {Object[]} account.utxos - The unspent transaction outputs for the account
  * @param {Number} account.utxos[].value - The value of the utxo (unit: satoshi)
  * @param {Number} account.utxos[].confirmations - The confirmations of the utxo
  * @param {String} account.utxos[].transactionHash - The hash of the transaction this utxo is in
  * @param {Number} account.utxos[].index - The index of this utxo in the transaction
  * @param {Number[]} account.utxos[].addressPath - The bip44 address path of the utxo
  * @param {Object[]} desiredOutputs - Outputs for the transaction (excluding change)
  * @param {String} desiredOutputs[].address - address to send to
  * @param {Number} desiredOutputs[].amount - amount to send (unit: satoshi)
  * @param {Number} feeRate - desired fee (unit: satoshi per byte)
  * @param {Boolean} [isSegwit=true] - True if this is a segwit transaction
  * @param {Number} [dustThreshold=546] - A change output will only be included when greater than this value.
  *   Otherwise it will be included as a fee instead (unit: satoshi)
  * @returns {Object}
  */
  buildPaymentTx(account, desiredOutputs, feeRate, isSegwit = true, dustThreshold = 546) {
    const { utxos, changeIndex, changeAddresses } = account
    let changeAddress = changeAddresses[changeIndex]
    const sortedUtxos = sortUtxos(utxos)

    const outputs = desiredOutputs.map(({ address, amount }) => ({ address, amount })) // Clone
    const outputCount = outputs.length + 1 // Plus one for change output
    let outputTotal = outputs.reduce((total, { amount }) => total + amount, 0)

    /* Select inputs and calculate appropriate fee */
    let fee = 0 // Total fee is recalculated when adding each input
    let amountWithFee = outputTotal + fee
    let inputUtxos = []
    let inputTotal = 0
    for (let i = 0; i < sortedUtxos.length; i++) {
      fee = estimateTxFee(feeRate, inputUtxos.length + 1, outputCount, isSegwit)
      amountWithFee = outputTotal + fee
      let utxo = sortedUtxos[i]
      inputTotal = inputTotal + utxo.value
      inputUtxos.push(utxo)
      if (inputTotal >= amountWithFee) break
    }

    if (amountWithFee > inputTotal) {
      const amountWithSymbol = `${outputTotal * 1e-8} ${this.assetSymbol}`
      if (outputTotal === inputTotal) {
        log.debug(`Attempting to send entire ${amountWithSymbol} balance. ` +
          `Subtracting fee of ${fee} sat from first output.`)
        amountWithFee = outputTotal
        outputs[0].amount -= fee
        outputTotal -= fee
        if (outputs[0].amount <= dustThreshold) {
          throw new Error('First output minus fee is below dust threshold')
        }
      } else {
        throw new Error(`You do not have enough UTXOs to send ${amountWithSymbol} with ${feeRate} sat/byte fee`)
      }
    }

    /* Build outputs */
    const outputBuilder = new TransactionBuilder(this.network)
    outputs.forEach(({ amount, address }) => outputBuilder.addOutput(address, amount))

    let change = inputTotal - amountWithFee
    let changePath = [1, changeIndex]
    if (change > dustThreshold) { // Avoid creating dust outputs
      outputBuilder.addOutput(changeAddress, change)
    } else {
      fee += change
      change = 0
      changeAddress = null
      changePath = null
    }
    const outputScript = outputBuilder.buildIncomplete().toHex().slice(10, -8) // required by ledgerjs api

    return {
      inputUtxos,
      outputs,
      outputScript,
      fee,
      change,
      changePath,
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

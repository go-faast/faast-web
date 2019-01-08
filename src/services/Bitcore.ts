import {
  WorkerDiscovery, BitcoreBlockchain, AccountLoadStatus,
  UtxoInfo as BaseUtxoInfo, AccountInfo as BaseAccountInfo,
} from 'hd-wallet'
import { TransactionBuilder } from 'bitcoinjs-lib'
import { pick, omit } from 'lodash'
import b58 from 'bs58check'
import bchaddr from 'bchaddrjs'

// @ts-ignore
import xpubWasmFile from 'hd-wallet/lib/fastxpub/fastxpub.wasm?file'
// @ts-ignore
import XpubWorker from 'hd-wallet/lib/fastxpub/fastxpub?worker'
// @ts-ignore
import SocketWorker from 'hd-wallet/lib/socketio-worker/inside?worker'
// @ts-ignore
import DiscoveryWorker from 'hd-wallet/lib/discovery/worker/inside?worker'

import log from 'Utilities/log'
import {
  estimateTxFee, getPaymentTypeForHdKey, convertHdKeyAddressEncoding, isSegwitSupported,
} from 'Utilities/bitcoin'
import networks, { NetworkConfig } from 'Utilities/networks'
import { FeeRate } from 'Types'

// setting up workers
const xpubWasmFilePromise = fetch(xpubWasmFile)
    .then((response) => response.ok ? response.arrayBuffer() : Promise.reject('failed to load fastxpub.wasm'))

const socketWorkerFactory = () => new SocketWorker()
const discoveryWorkerFactory = () => new DiscoveryWorker()

export type UtxoInfo = BaseUtxoInfo & {
  confirmations: number,
}

export type AccountInfo = BaseAccountInfo & {
  utxos: UtxoInfo[],
}

export type TxOutput = {
  address: string,
  amount: number,
}

export type PaymentTx = {
  inputUtxos: UtxoInfo[]
  outputs: TxOutput[]
  outputScript: string,
  fee: number,
  change: number,
  changePath: number[],
  changeAddress: string,
  isSegwit: boolean,
}

/**
 * Sort the utxos for input selection
 */
function sortUtxos(utxoList: UtxoInfo[]): UtxoInfo[] {
  const matureList: UtxoInfo[] = []
  const immatureList: UtxoInfo[] = []
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

export class Bitcore extends BitcoreBlockchain {

  assetSymbol: string
  network: NetworkConfig
  discovery: WorkerDiscovery

  constructor(config: NetworkConfig) {
    super(config.bitcoreUrls, socketWorkerFactory)
    this.assetSymbol = config.symbol
    this.network = config
    this.discovery = new WorkerDiscovery(discoveryWorkerFactory, new XpubWorker(), xpubWasmFilePromise, this)
  }

  toJSON() {
    return Object.assign({}, this, {
      discovery: omit(this.discovery, 'chain'), // Avoid circular reference
    })
  }

  /**
   * Discover the balance, transactions, unused addresses, etc of an extended public key.
   *
   * @param hdKey - The extended public key to discover
   * @param [onUpdate] - Callback for partial updates to discover result
   * @returns Account info promise
   */
  discoverAccount(hdKey: string, onUpdate?: (status: AccountLoadStatus) => void): Promise<AccountInfo> {
    return Promise.resolve()
      .then(() => {
        const paymentType = getPaymentTypeForHdKey(hdKey, this.network)
        const { addressEncoding } = paymentType
        if (!(['P2PKH', 'P2SH-P2WPKH']).includes(addressEncoding)) {
          throw new Error(`discoverAccount does not support ${addressEncoding} addressEncoding`)
        }

        /*
         * I noticed that while discovering a bitcoin and litecoin account simultaneously, the call to deriveXpub
         * used by discoverAccount returned the same result for both calls resulting in one of them throwing an
         * "Invalid network version" error as the invalid key was passed into HDNode.fromBase58.
         * From this is was able to determine that the xpub derivation library used by discoverAccount is
         * stateful in some way and doesn't support simultaneous derivations with different bip32 versions.
         * I was able to work around this issue by always passing in a new XpubWorker when creating WorkerDiscovery
         * but this only helped with collisions between currencies. I believe the issue is still present if you were
         * to try deriving an bitcoin xpub and ypub simultaneously because they use different bip32 versions.
         * To work around this we can convert all hd keys into their xpub or P2PKH format so that the bip32
         * versions used are the same for all accounts of a specific currency.
         */
        const segwit: 'off' | 'p2sh' = addressEncoding === 'P2SH-P2WPKH' ? 'p2sh' : 'off'
        const xpub = addressEncoding === 'P2PKH' ? hdKey : convertHdKeyAddressEncoding(hdKey, 'P2PKH', this.network)

        const cashAddress = false // To maintain compatability with bitcoinjs-lib don't use bchaddr format
        const process = this.discovery.discoverAccount(null, xpub, this.network.bitcoinJsNetwork, segwit, cashAddress)
        if (onUpdate) {
          process.stream.values.attach(onUpdate)
        }
        return process.ending
          .then((result: BaseAccountInfo) => ({
            ...result,
            utxos: result.utxos.map((utxo: BaseUtxoInfo) => ({
              ...utxo,
              confirmations: utxo.height ? result.lastBlock.height - utxo.height : 0,
            })),
          }))
          .catch((e: Error) => {
            log.error(`${this.network.symbol} discoverAccount error for ${paymentType.bip32.publicPrefix} key`, e)
            throw e
          })
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
   * @param {FeeRate|Number} feeRate - desired fee (unit: satoshi per byte)
   * @param {Boolean} [isSegwit=true] - True if this is a segwit transaction
   * @param {Number} [dustThreshold=546] - A change output will only be included when greater than this value.
   *   Otherwise it will be included as a fee instead (unit: satoshi)
   * @returns {Object}
   */
  buildPaymentTx(
    account: AccountInfo,
    desiredOutputs: Array<{ address: string, amount: number}>,
    feeRate: FeeRate | number,
    isSegwit = true,
    dustThreshold?: number,
  ): PaymentTx {
    const { utxos, changeIndex, changeAddresses } = account
    let changeAddress = changeAddresses[changeIndex]
    const sortedUtxos = sortUtxos(utxos)

    if (isSegwit && !isSegwitSupported(this.network)) {
      throw new Error(`Segwit not supported for ${this.network.symbol}`)
    }

    if (typeof dustThreshold === 'undefined') {
      dustThreshold = typeof this.network.dustThreshold !== 'undefined'
        ? this.network.dustThreshold
        : 546
    }

    const outputs = desiredOutputs
      .map(({ address, amount }, i) => {
        // validate
        if (typeof address !== 'string') {
          throw new Error(`Invalid address ${address} provided for output ${i}`)
        }
        if (typeof amount !== 'number') {
          throw new Error(`Invalid amount ${amount} provided for output ${i}`)
        }
        if (this.network.symbol === 'BCH') {
          // Convert to legacy for compatability with bitcoinjs-lib
          address = bchaddr.toLegacyAddress(address)
        }
        // return copy
        return { address, amount }
      })
    const outputCount = outputs.length + 1 // Plus one for change output
    let outputTotal = outputs.reduce((total, { amount }) => total + amount, 0)

    /* Select inputs and calculate appropriate fee */
    let fee = 0 // Total fee is recalculated when adding each input
    let amountWithFee = outputTotal + fee
    const inputUtxos = []
    let inputTotal = 0
    for (const utxo of sortedUtxos) {
      fee = estimateTxFee(feeRate, inputUtxos.length + 1, outputCount, isSegwit)
      amountWithFee = outputTotal + fee
      inputTotal = inputTotal + utxo.value
      inputUtxos.push(utxo)
      if (inputTotal >= amountWithFee) {
        break
      }
    }

    // Ensure calculated fee is above network minimum
    const minTxFee = this.network.minTxFee
    if (minTxFee) {
      const minTxFeeSat = estimateTxFee(minTxFee, inputUtxos.length, outputCount, isSegwit)
      if (fee < minTxFeeSat) {
        fee = minTxFeeSat
      }
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
    log.debug(`Creating ${this.assetSymbol} tx with outputs`, outputs)
    const outputBuilder = new TransactionBuilder(this.network.bitcoinJsNetwork)
    outputs.forEach(({ amount, address }) => outputBuilder.addOutput(address, amount))

    let change = inputTotal - amountWithFee
    let changePath = [1, changeIndex]
    if (change > dustThreshold) { // Avoid creating dust outputs
      outputBuilder.addOutput(changeAddress, change)
    } else {
      log.debug(`Change of ${change} sat is below dustThreshold of ${dustThreshold}, adding to fee`)
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

const bitcoreInstances: { [symbol: string]: Bitcore } = {}

/** Get the Bitcore service for the specified asset */
export function getBitcore(assetSymbol: string): Bitcore {
  const bitcore = bitcoreInstances[assetSymbol]
  if (bitcore) {
    return bitcore
  }
  const networkConfig = networks[assetSymbol]
  if (networkConfig) {
    log.debug('Creating new Bitcore for network', networkConfig)
    return (bitcoreInstances[assetSymbol] = new Bitcore(networkConfig))
  }
  throw new Error(`Bitcore not configured for asset ${assetSymbol}`)
}

export default {
  getBitcore,
  Bitcore,
}

import { networks } from 'bitcoinjs-lib-zcash'
import { WorkerDiscovery, BitcoreBlockchain } from 'hd-wallet'

import xpubWasmFile from 'hd-wallet/lib/fastxpub/fastxpub.wasm?file'

import XpubWorker from 'hd-wallet/lib/fastxpub/fastxpub?worker'
import SocketWorker from 'hd-wallet/lib/socketio-worker/inside?worker'
import DiscoveryWorker from 'hd-wallet/lib/discovery/worker/inside?worker'

import { ypubToXpub } from 'Utilities/bitcoin'

// setting up workers
const xpubWorker = new XpubWorker()
const xpubWasmFilePromise = fetch(xpubWasmFile)
    .then(response => response.ok ? response.arrayBuffer() : Promise.reject('failed to load'))

const socketWorkerFactory = () => new SocketWorker()
const discoveryWorkerFactory = () => new DiscoveryWorker()

class Bitcore {
  constructor(networkConfig, bitcoreUrls) {
    this.network = networkConfig
    this.bitcoreUrls = bitcoreUrls
    this.blockchain = new BitcoreBlockchain(bitcoreUrls, socketWorkerFactory)
    this.discovery = new WorkerDiscovery(discoveryWorkerFactory, xpubWorker, xpubWasmFilePromise, this.blockchain)
  }

  discoverAccount = (xpub, onUpdate) => Promise.resolve()
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
      return process.ending
    })

  getTransaction = (txId) => this.blockchain.lookupTransaction(txId)
}

const assetToBitcore = {
  BTC: new Bitcore(networks.bitcoin, ['https://blockexplorer.com', 'https://bitcore1.trezor.io', 'https://bitcore3.trezor.io']),
  LTC: new Bitcore(networks.litecoin, ['https://ltc-bitcore3.trezor.io']),
}

const getBitcoreForAsset = (asset) => Promise.resolve()
  .then(() => {
    const bitcore = assetToBitcore[asset]
    if (!bitcore) {
      throw new Error(`Asset ${asset} has no Bitcore configuration`)
    }
    return bitcore
  })

const discover = (asset, xpub, onUpdate) => getBitcoreForAsset(asset)
  .then((bitcore) => bitcore.discoverAccount(xpub, onUpdate))

const getTransaction = (asset, txId) => getBitcoreForAsset(asset)
  .then((bitcore) => bitcore.getTransaction(txId))

import Ledger from 'Services/Ledger'
import log from 'Utilities/log'
import { TransactionBuilder } from 'bitcoinjs-lib'
import BigNumber from 'bignumber.js'
const segwit = true

/**
 * This is a function for selecting utxos to build transactions.
 * The transaction object requires at least 2 fields, value (satoshis) and confirmations.
 * This function is based off of qtumjs-lib/src/utils.js#selectTxs
 *
 * @param [transaction] allUtxos
 * @param Number amount (unit: satoshi)
 * @param Number fee (unit: satoshi)
 * @returns [transaction]
 */
function selectUtxos(allUtxos, amount, fee) {
  //sort the utxo
  const matureList = []
  const immatureList = []
  for (let i = 0; i < allUtxos.length; i++) {
    if (allUtxos[i].confirmations >= 6) {
      matureList[matureList.length] = allUtxos[i]
    } else {
      immatureList[immatureList.length] = allUtxos[i]
    }
  }
  matureList.sort(function(a, b) {return a.value - b.value})
  immatureList.sort(function(a, b) {return b.confirmations - a.confirmations})
  allUtxos = matureList.concat(immatureList)

  let value = new BigNumber(amount).plus(fee)
  let find = []
  let findTotal = new BigNumber(0)
  for (let i = 0; i < allUtxos.length; i++) {
    let tx = allUtxos[i]
    findTotal = findTotal.plus(tx.value)
    find[find.length] = tx
    if (findTotal.greaterThanOrEqualTo(value)) break
  }
  if (value.greaterThan(findTotal)) {
    throw new Error('You do not have enough QTUM to send')
  }
  return find
}


function signTx(assetSymbol, to, amount, fee, changeAddress, utxoList) {
  return Promise.all(
    utxoList.map((utxo) => getTransaction(assetSymbol, utxo.transactionHash)
      .then((txInfo) => Ledger.btc.splitTransaction(txInfo.hex, segwit)
        .then((splitTx) => ({
          ...utxo,
          txInfo,
          splitTx
        })))))
  .then((utxoList) => {
    console.log(utxoList)
    const inputs = []
    const paths = []
    let totalInputAmount = new BigNumber(0)
    utxoList.forEach((utxo) => {
      inputs.push([utxo.splitTx, utxo.index])
      paths.push('m/49\'/0\'/0\'')
      totalInputAmount = totalInputAmount.plus(utxo.value)
    })

    const amountSat = new BigNumber(amount)
    const feeSat = new BigNumber(fee)
    const outputs = new TransactionBuilder(assetToNetwork[assetSymbol])
    outputs.addOutput(to, amountSat.toNumber())
    const changeSat = totalInputAmount.minus(amountSat).minus(feeSat)
    outputs.addOutput(changeAddress, changeSat.toNumber())
    const outputScript = outputs.buildIncomplete().toHex().slice(10, -8)

    return Ledger.btc.createPaymentTransactionNew(...log.infoInline([inputs, paths, undefined, outputScript, undefined, undefined, segwit]))
  })
}

discover('BTC', 'ypub6QqdH2c5z79681aKxZwr1kFUvJdpBHd5uLevM3zN8mod2jxySS8t3M4Pqki3HRRYU5LL6qJUY3ZM6qsr6cDYGxuBjCUAaijXUu1p64QUtzc')
  .then((result) => {
    console.log(result)
    return signTx('BTC', '3HLF6edYCPi7pE29V718N4tRH29fXmNdKw', 200000, 3154, '3Qhu8XEAiFRSsNDmvrTiGwZ5FWvtrN9ngx', [{
      addressPath: [0, 0],
      coinbase: false,
      fee: undefined,
      height: 529348,
      index: 1,
      own: false,
      transactionHash: 'e7b78f00c393a5f12fb3e6dfb5e51c7afb840d3c8a81b37c5fa73d5d4a0b5e51',
      tsize: 406,
      value: 286535,
      vsize: 406,
    }])
  })
  .then(log.infoInline)
  .catch(log.errorInline)

export default {
  discover,
  getTransaction
}

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

export default {
  discover,
  getTransaction
}

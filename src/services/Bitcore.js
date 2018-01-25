import { networks } from 'bitcoinjs-lib-zcash'

import { WorkerDiscovery, BitcoreBlockchain } from 'hd-wallet'

import xpubWasmFile from 'hd-wallet/lib/fastxpub/fastxpub.wasm?file'

import XpubWorker from 'hd-wallet/lib/fastxpub/fastxpub?worker'
import SocketWorker from 'hd-wallet/lib/socketio-worker/inside?worker'
import DiscoveryWorker from 'hd-wallet/lib/discovery/worker/inside?worker'

// setting up workers
const xpubWorker = new XpubWorker()
const xpubWasmFilePromise = fetch(xpubWasmFile)
    .then(response => response.ok ? response.arrayBuffer() : Promise.reject('failed to load'));

const socketWorkerFactory = () => new SocketWorker();
const discoveryWorkerFactory = () => new DiscoveryWorker();

const BITCORE_URLS = ['https://bitcore1.trezor.io', 'https://bitcore3.trezor.io'];
const blockchain = new BitcoreBlockchain(BITCORE_URLS, socketWorkerFactory);
const discovery = new WorkerDiscovery(discoveryWorkerFactory, xpubWorker, xpubWasmFilePromise, blockchain);

const assetToNetwork = {
  BTC: networks.bitcoin,
  LTC: networks.litecoin
}

function discover(asset, xpub, onUpdate) {
  return new Promise((resolve, reject) => {
    const network = assetToNetwork[asset]
    if (!network) {
      return reject(new Error(`No network defined for asset ${asset}`))
    }
    const process = discovery.discoverAccount(null, xpub, network);
    process.stream.values.attach(onUpdate);
    process.ending.then(resolve);
  })
}

export default {
  discover,
}

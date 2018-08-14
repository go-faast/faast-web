import { Network as BitcoinJsNetwork, HDNode as BitcoinJsHDNode } from 'bitcoinjs-lib';
import {
  AccountInfo,
  AccountLoadStatus,
  ForceAddedTransaction,
} from './index';
import { Emitter, Stream, StreamWithEnding } from './stream';
import { Blockchain, TransactionWithHeight } from './bitcore';
import { BrowserAddressSource, WorkerAddressSource, AddressSource } from './address-source';

export class WorkerDiscovery {
  discoveryWorkerFactory: () => Worker;
  addressWorkerChannel: ?AddressWorkerChannel;
  chain: Blockchain;

  constructor(
    discoveryWorkerFactory: () => Worker,
    fastXpubWorker: Worker,
    fastXpubWasmPromise: Promise<ArrayBuffer>,
    chain: Blockchain,
  )

  tryHDNode(xpub: string, network: BitcoinJsNetwork): BitcoinJsHDNode | Error

  forceAddedTransactions: Array<ForceAddedTransaction> = [];
  forceAddedTransactionsEmitter: Emitter<boolean> = new Emitter();
  forceAddedTransactionsStream: Stream<'block' | TransactionWithHeight> = Stream.fromEmitter(this.forceAddedTransactionsEmitter, () => {}).map(() => 'block');

  // useful for adding transactions right after succesful send
  forceAddTransaction(
    transaction: ForceAddedTransaction
  ): void

  detectUsedAccount(
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    gap_?: number
  ): Promise<boolean>

  discoverAccount(
    initial?: AccountInfo,
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    cashAddress: boolean,
    gap: number,
    timeOffset: number,
  ): StreamWithEnding<AccountLoadStatus, AccountInfo>

  monitorAccountActivity(
    initial: AccountInfo,
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    cashAddress: boolean,
    gap: number,
    timeOffset: number,
  ): Stream<AccountInfo | Error>

  createAddressSource(node: BitcoinJsHDNode, network: BitcoinJsNetwork, segwit: 'off' | 'p2sh'): AddressSource

  createWorkerAddressSource(node: BitcoinJsHDNode, network: BitcoinJsNetwork, segwit: 'off' | 'p2sh'): ?WorkerAddressSource

  deriveXpub(
    xpub: string,
    network: BitcoinJsNetwork,
    index: number
  ): Promise<string>
}

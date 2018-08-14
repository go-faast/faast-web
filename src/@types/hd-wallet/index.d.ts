/// <reference types="./address-source"/>
/// <reference types="./bitcore"/>
/// <reference types="./discovery"/>
/// <reference types="./worker-discovery"/>
/// <reference types="./stream"/>
/// <reference types="./simple-worker-channel"/>
// /// <reference types="./build-tx"/>

declare module 'hd-wallet' {
  // ./address-source
  export { AddressSource, BrowserAddressSource }
  // ./bitcore
  export { SyncStatus, TransactionWithHeight, TxFees, Blockchain }
  // ./discovery
  export {
    UtxoInfo, TargetInfo, TransactionInfo, AddressWithReceived, AccountInfo,
    AccountLoadStatus, ForceAddedTransaction, Discovery,
  }
  // ./stream
  export { Emitter, Disposer, Stream, StreamWithEnding }
  // ./simple-worker-channel
  export { WorkerChannel }

  export class BitcoreBlockchain {
    errors: Stream<Error>; // socket errors
    notifications: Stream<TransactionWithHeight>; // activity on subscribed addresses
    blocks: Stream<void>;

    addresses: Set<string>; // subscribed addresses
    socket: Deferred<Socket>;

    socketWorkerFactory: SocketWorkerFactory;
    endpoints: Array<string>;
    workingUrl: string;
    zcash: boolean;

    hasSmartTxFees: boolean; // does server support estimatesmartfee

    _silent: boolean = false; // don't show errors; on testing

    constructor(endpoints: Array<string>, socketWorkerFactory: SocketWorkerFactory)

    // this creates ANOTHER socket!
    // this is for repeated checks after one failure
    hardStatusCheck(): Promise<boolean>

    subscribe(inAddresses: Set<string>)

    destroy()

    // start/end are the block numbers, inclusive.
    // start is BIGGER than end
    // anti-intuitive, but the same as bitcore API
    lookupTransactionsStream(
        addresses: Array<string>,
        start: number,
        end: number
    ): Stream<Array<TransactionWithHeight> | Error>

    // start/end are the block numbers, inclusive.
    // start is BIGGER than end
    // anti-intuitive, but the same as bitcore API
    lookupTransactions(
        addresses: Array<string>,
        start: number,
        end: number
    ): Promise<Array<TransactionWithHeight>>

    lookupTransactionsIds(
        addresses: Array<string>,
        start: number,
        end: number
    ): Promise<Array<string>>

    lookupTransaction(hash: string): Promise<TransactionWithHeight>

    sendTransaction(hex: string): Promise<string>

    lookupBlockHash(height: number): Promise<string>

    lookupSyncStatus(): Promise<BcSyncStatus>

    estimateSmartTxFees(blocks: Array<number>, conservative: boolean): Promise<TxFees>

    estimateTxFees(blocks: Array<number>, skipMissing: boolean): Promise<TxFees>

  }

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
      cashAddress?: boolean,
      gap?: number,
      timeOffset?: number,
    ): StreamWithEnding<AccountLoadStatus, AccountInfo>

    monitorAccountActivity(
      initial: AccountInfo,
      xpub: string,
      network: BitcoinJsNetwork,
      segwit: 'off' | 'p2sh',
      cashAddress?: boolean,
      gap?: number,
      timeOffset?: number,
    ): Stream<AccountInfo | Error>

    createAddressSource(node: BitcoinJsHDNode, network: BitcoinJsNetwork, segwit: 'off' | 'p2sh'): AddressSource

    createWorkerAddressSource(node: BitcoinJsHDNode, network: BitcoinJsNetwork, segwit: 'off' | 'p2sh'): ?WorkerAddressSource

    deriveXpub(
      xpub: string,
      network: BitcoinJsNetwork,
      index: number
    ): Promise<string>
  }

}

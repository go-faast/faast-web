import { Stream } from './stream';
import { Deferred } from './deferred';
import { Socket } from './socketio-worker-outside';

export type SyncStatus = { height: number };

export type TransactionWithHeight = {
  hex: string,
  zcash: boolean,
  height: ?number,
  timestamp: ?number,
  hash: string,
  inputAddresses: Array<?string>,
  outputAddresses: Array<?string>,
  vsize: number,
}

export type TxFees = {[blocks: number]: number};

export type Blockchain = {
  errors: Stream<Error>,
  notifications: Stream<TransactionWithHeight>,
  blocks: Stream<void>,

  workingUrl: string,

  subscribe(addresses: Set<string>): void,
  lookupTransactionsStream(
      addresses: Array<string>,
      start: number,
      end: number
  ): Stream<Array<TransactionWithHeight> | Error>,

  lookupTransactionsIds(
      addresses: Array<string>,
      start: number,
      end: number
  ): Promise<Array<string>>,

  lookupTransaction(hash: string): Promise<TransactionWithHeight>,
  lookupBlockHash(height: number): Promise<string>,
  lookupSyncStatus(): Promise<SyncStatus>,
  sendTransaction(hex: string): Promise<string>,

  // this creates ANOTHER socket!
  // this is for repeated checks after one failure
  hardStatusCheck(): Promise<boolean>,

  estimateTxFees(blocks: Array<number>, skipMissing: boolean): Promise<TxFees>,
};

// Types beginning with Bc - bitcore format
type BcDetailedInput = {
    address: ?string,
    outputIndex: ?number,
    prevTxId: ?string, // coinbase
    satoshis: number,
    script: string,
    scriptAsm: ?string,
    sequence: number,
}

type BcDetailedOutput = {
    address: ?string,
    satoshis: number,
    script: string,
    scriptAsm: string,
}

type BcDetailedTransaction = {
    blockTimestamp: ?number, // undef on unconfirmed
    hash: string,
    height: number, // -1 on unconfirmed
    hex: string,
    inputSatoshis: number,
    inputs: Array<BcDetailedInput>,
    locktime: number,
    outputSatoshis: number,
    outputs: Array<BcDetailedOutput>,
    version: number,
    size: ?number, // if SatoshiLabs segwit fork of bitcore -> vsize; if original -> empty
}

type BcSyncStatus = { height: number };
type BcTransactionInfo = {
    tx: BcDetailedTransaction,
    confirmations: number, // 0 if no
    satoshis: number, // not sure what this means
};
type BcHistory = { addresses: { [address: string]: Object } } & BcTransactionInfo;
type BcHistories = { items: Array<BcHistory>, totalCount: number };

type SocketWorkerFactory = () => Worker;

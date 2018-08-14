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
  export { SyncStatus, TransactionWithHeight, TxFees, Blockchain, BitcoreBlockchain }
  // ./discovery
  export {
    UtxoInfo, TargetInfo, TransactionInfo, AddressWithReceived, AccountInfo,
    AccountLoadStatus, ForceAddedTransaction, Discovery,
  }
  // ./worker-discovery
  export { WorkerDiscovery }
  // ./stream
  export { Emitter, Disposer, Stream, StreamWithEnding }
  // ./simple-worker-channel
  export { WorkerChannel }
}

import { Stream, StreamWithEnding } from './stream'

export type UtxoInfo = {
  index: number, // index of output IN THE TRANSACTION
  transactionHash: string, // hash of the transaction
  value: number, // how much money sent
  addressPath: [number, number], // path
  height?: number, // null == unconfirmed
  coinbase: boolean,
  tsize: number, // total size - in case of segwit, total, with segwit data
  vsize: number, // virtual size - segwit concept - same as size in non-segwit
  own: boolean, // is the ORIGIN me (the same account)
}

// Some info about output
export type TargetInfo = {
  address: string,
  value: number,
  i: number, // index in the transaction
}

export type TransactionInfo = {
  isCoinbase: boolean,

  // unix timestamp
  timestamp: ?number,

  // I am saving it like this, because mytrezor is in angular
  // and directly displays this
  // and it saves suprisingly a lot of time
  // since otherwise Angular would recompute it repeatedly
  // only day YYYY-MM-DD
  dateInfoDayFormat: ?string,
  // only time HH:MM:SS
  dateInfoTimeFormat: ?string,

  height: ?number,
  confirmations: ?number,

  hash: string,

  // targets - only the shown and "relevant" outputs
  // note: should not be used in any advanced logic, it's heuristic
  targets: TargetInfo[],

  // all outputs that belong to my addresses
  myOutputs: { [i: number]: TargetInfo },

  type: 'self' | 'recv' | 'sent',

  // value - tx itself
  // balance - balance on account after this tx
  // both are little heuristics! it is "relevant" value/balance
  value: number,
  balance: number,

  inputs: Array<{ id: string, index: number }>, // needing this for later analysis

  tsize: number, // total size - in case of segwit, total, with segwit data
  vsize: number, // virtual size - segwit concept - same as size in non-segwit
}

// This is used for used addresses
// Where we display address and number of received BTC.
// NOTE: received does *not* mean current balance on address!!!
// We don't expose that to the user.
// It's really just sum of received outputs.
export type AddressWithReceived = {
  // regular base58check address
  address: string,
  // received, in satoshis
  received: number,
};

// Complete info about one account.
// (trezor usually has several accounts, 1 at minimum)
export type AccountInfo = {
  utxos: UtxoInfo[],
  transactions: TransactionInfo[],

  // all addresses FROM THE MAIN CHAIN that has at least 1 received transaction
  usedAddresses: AddressWithReceived[],

  // addresses that has <1 transaction
  // (max 20, but can be less! can be even 0)
  unusedAddresses: string[],

  // in mytrezor, I would need just one change address, but useful for setting up watching
  changeAddresses: string[],

  // first unused change index
  changeIndex: number,

  // not used in mytrezor, useful in discovery
  lastConfirmedChange: number,
  lastConfirmedMain: number,

  // if there is 20 change addresses in a row all used, but unconfirmed (rarely happens)
  // we don't allow change and we don't allow sending
  // (not yet implemented in GUI, since it happens super rarely)
  allowChange: boolean,

  // balance (== all utxos added)
  balance: number,

  // index for outgoing addresses; not including mine self-sents
  sentAddresses: { [txPlusIndex: string]: string },

  // what is last block I saw
  lastBlock: { height: number, hash: string },

  // version of saved data - allows updates
  // version null => original version
  // version 1 => added fees and sizes to utxos+history - needs re-download
  version: number,
}

// This is number of currently loaded transactions.
// Used only for displaying "Loading..." status.
export type AccountLoadStatus = {
  transactions: number,
}

export type ForceAddedTransaction = {
  hex: string,
  zcash: boolean,
  hash: string,
  inputAddresses: Array<?string>,
  outputAddresses: Array<?string>,
  vsize: number,
  fee: number,
}

export type Discovery = {
  discoverAccount: (
    initial?: AccountInfo,
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    cashAddress: boolean,
    gap: number,
    timeOffset: number,
  ) => StreamWithEnding<AccountLoadStatus, AccountInfo>,

  detectUsedAccount: (
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    gap?: number,
  ) => Promise<boolean>,

  monitorAccountActivity: (
    initial: AccountInfo,
    xpub: string,
    network: BitcoinJsNetwork,
    segwit: 'off' | 'p2sh',
    cashAddress: boolean,
    gap: number,
    timeOffset: number,
  ) => Stream<AccountInfo | Error>,

  // force-adds transaction to multiple addresses
  // (useful for adding transactions right after succesful send)
  forceAddTransaction: (
    transaction: ForceAddedTransaction,
  ) => void,

  // helper function for the rest of wallet for xpub derivation -
  // it is here because WASM is done here...
  deriveXpub: (
    xpub: string,
    network: BitcoinJsNetwork,
    index: number,
  ) => Promise<string>,
}

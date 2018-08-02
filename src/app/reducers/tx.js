import { createReducer } from 'redux-act'
import { omit, pick, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { resetAll } from 'Actions/app'
import {
  txsRestored,
  txRestored,
  txAdded,
  txUpdated,
  txRemoved,
  txHashUpdated,
  txReceiptUpdated,
  txConfirmationsUpdated,
  txSigningStart,
  txSigningSuccess,
  txSigningFailed,
  txSendingStart,
  txSendingSuccess,
  txSendingFailed,
} from 'Actions/tx'

const initialState = {}
const txUnpersistedInitialState = {
  signing: false,
  signingError: '',
  sending: false,
  sendingError: '',
  receipt: null,
}
const txInitialState = {
  id: '',
  walletId: '',
  type: '',
  assetSymbol: '',
  feeAmount: null,
  feeSymbol: '',
  outputs: [],
  txData: null,
  signedTxData: null,
  hash: null,
  signed: false,
  sent: false,
  ...txUnpersistedInitialState
}

const normalize = (tx) => pick(tx, Object.keys(txInitialState))
const prune = (tx) => omit(tx, Object.keys(txUnpersistedInitialState))

const upsertTx = createUpserter('id', txInitialState)
const updateTx = createUpdater('id')

export default createReducer({
  [resetAll]: () => initialState,
  [txsRestored]: (state, txs) => (isObject(txs) ? Object.values(txs) : txs)
    .map(prune)
    .map(normalize)
    .reduce(upsertTx, {}),
  [txRestored]: (state, tx) => upsertTx(state, normalize(prune(tx))),
  [txAdded]: (state, tx) => upsertTx(state, normalize(tx)),
  [txUpdated]: (state, tx) => updateTx(state, normalize(tx)),
  [txRemoved]: (state, { id }) => omit(state, id),
  [txHashUpdated]: updateTx,
  [txReceiptUpdated]: updateTx,
  [txConfirmationsUpdated]: updateTx,
  [txSigningStart]: (state, { id }) => updateTx(state, { id, signing: true, signingError: '' }),
  [txSigningSuccess]: (state, updatedTx) => updateTx(state, normalize({ ...updatedTx, signing: false, signed: true })),
  [txSigningFailed]: (state, { id, signingError }) => updateTx(state, { id, signing: false, signingError: signingError }),
  [txSendingStart]: (state, { id }) => updateTx(state, { id, sending: true, sendingError: '' }),
  [txSendingSuccess]: (state, updatedTx) => updateTx(state, normalize({ ...updatedTx, sending: false, sent: true })),
  [txSendingFailed]: (state, { id, sendingError }) => updateTx(state, { id, sending: false, sendingError: sendingError }),
}, initialState)

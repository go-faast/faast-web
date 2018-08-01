import { createReducer } from 'redux-act'
import { omit, pick, isObject } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'
import { resetAll } from 'Actions/app'
import {
  setTxs,
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
  signing: false,
  signed: false,
  signingError: '',
  sending: false,
  sent: false,
  sendingError: '',
  receipt: null,
}

const normalize = (tx) => pick(tx, Object.keys(txInitialState))

const upsertTx = createUpserter('id', txInitialState)
const updateTx = createUpdater('id')

export default createReducer({
  [resetAll]: () => initialState,
  [setTxs]: (state, txs) => (isObject(txs) ? Object.values(txs) : txs)
    .map(normalize)
    .reduce(upsertTx, {}),
  [txAdded]: (state, tx) => upsertTx(state, normalize(tx)),
  [txUpdated]: (state, tx) => updateTx(state, normalize(tx)),
  [txRemoved]: (state, { id }) => omit(state, id),
  [txHashUpdated]: updateTx,
  [txReceiptUpdated]: updateTx,
  [txConfirmationsUpdated]: updateTx,
  [txSigningStart]: (state, { id }) => updateTx(state, { id, signing: true, signingError: '' }),
  [txSigningSuccess]: (state, updatedTx) => updateTx(state, { ...updatedTx, signing: false, signed: true }),
  [txSigningFailed]: (state, { id, signingError }) => updateTx(state, { id, signing: false, signingError: signingError }),
  [txSendingStart]: (state, { id }) => updateTx(state, { id, sending: true, sendingError: '' }),
  [txSendingSuccess]: (state, updatedTx) => updateTx(state, { ...updatedTx, sending: false, sent: true }),
  [txSendingFailed]: (state, { id, sendingError }) => updateTx(state, { id, sending: false, sendingError: sendingError }),
}, initialState)

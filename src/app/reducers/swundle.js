import { createReducer } from 'redux-act'
import { omit } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'

import { resetAll } from 'Actions/app'

import {
  setSwundles, swundleAdded, swundleRemoved, swundleDismissed,
  initStarted, initSuccess, initFailed,
  signStarted, signSuccess, signFailed,
  sendStarted, sendSuccess, sendFailed,
} from 'Actions/swundle'

const initialState = {}
const swundleInitialState = {
  id: '',
  dismissed: false,
  initializing: false,
  initialized: false,
  signing: false,
  signed: false,
  sending: false,
  sent: false,
  error: '',
  createdDate: 0,
  swaps: [],
}

const upsert = createUpserter('id', swundleInitialState)
const update = createUpdater('id')

export default createReducer({
  [resetAll]: () => initialState,
  [setSwundles]: (state, swundles) => swundles,
  [swundleAdded]: upsert,
  [swundleRemoved]: (state, { id }) => omit(state, id),
  [swundleDismissed]: (state, { id }) => update(state, { id, dismissed: true }),
  [initStarted]: (state, { id }) => update(state, { id, initializing: true, initialized: false, error: swundleInitialState.error }),
  [initSuccess]: (state, { id }) => update(state, { id, initializing: false, initialized: true }),
  [initFailed]: (state, { id, error }) => update(state, { id, initializing: false, error }),
  [signStarted]: (state, { id }) => update(state, { id, signing: true, signed: false, error: swundleInitialState.error }),
  [signSuccess]: (state, { id }) => update(state, { id, signing: false, signed: true }),
  [signFailed]: (state, { id, error }) => update(state, { id, signing: false, error }),
  [sendStarted]: (state, { id }) => update(state, { id, sending: true, sent: false, error: swundleInitialState.error }),
  [sendSuccess]: (state, { id }) => update(state, { id, sending: false, sent: true }),
  [sendFailed]: (state, { id, error }) => update(state, { id, sending: false, error })
}, initialState)

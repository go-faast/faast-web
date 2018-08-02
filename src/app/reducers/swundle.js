import { createReducer } from 'redux-act'
import { isObject, omit, pick } from 'lodash'

import { createUpdater, createUpserter } from 'Utilities/helpers'

import { resetAll } from 'Actions/app'

import {
  swundlesRestored, swundleAdded, swundleRemoved, swundleDismissed,
  initStarted, initSuccess, initFailed,
  signStarted, signSuccess, signFailed,
  sendStarted, sendSuccess, sendFailed,
} from 'Actions/swundle'

const initialState = {}

const swundleUnpersistedInitialState = {
  initializing: false,
  signing: false,
  sending: false,
  error: '',
}
const swundleInitialState = {
  id: '',
  createdDate: 0,
  swaps: [],
  dismissed: false,
  initialized: false,
  signed: false,
  sent: false,
  ...swundleUnpersistedInitialState
}

const normalize = (swundle) => pick(swundle, Object.keys(swundleInitialState))

const upsert = createUpserter('id', swundleInitialState)
const update = createUpdater('id')

export default createReducer({
  [resetAll]: () => initialState,
  [swundlesRestored]: (state, swundles) => (isObject(swundles) ? Object.values(swundles) : swundles)
    .map((swundle) => omit(swundle, Object.keys(swundleUnpersistedInitialState)))
    .map(normalize)
    .reduce(upsert, {}),
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

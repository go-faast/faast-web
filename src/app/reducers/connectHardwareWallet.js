import { createReducer } from 'redux-act'

import {
  stateReset, derivationPathChanged,
  connectTimeoutStarted, connectTimeoutCleared, retryTimerStarted, retryTimerTicked, retryTimerCleared,
  setStatusWaiting, setStatusConnecting, setStatusConnected, setStatusCancelled, setStatusError,
  selectedAccountIndexChanged, resetAccountState, setShowAccountSelect,
  accountPageChanged, accountPageSizeChanged, accountLoadStart, accountLoadEnd,
} from 'Actions/connectHardwareWallet'

const initialState = {
  status: '',
  derivationPath: null,
  connectTimeoutId: null,
  retryTimerId: null,
  retryTimerSeconds: 0,
  accountRetriever: () => Promise.resolve(),
  showAccountSelect: false,
  accounts: [],
  accountPageSize: 5,
  selectedPageIndex: 0,
  selectedAccountIndex: 0,
}

const merge = (state, payload) => ({ ...state, ...payload })

const mergeAccount = (state, { index, ...payload }) => {
  const merged = [...state.accounts]
  merged[index] = {
    ...(merged[index] || {}),
    ...payload
  }
  return { ...state, accounts: merged }
}

export default createReducer({
  [stateReset]: () => initialState,
  [derivationPathChanged]: merge,
  [connectTimeoutStarted]: merge,
  [connectTimeoutCleared]: (state) => ({
    ...state,
    connectTimeoutId: initialState.connectTimeoutId
  }),
  [retryTimerStarted]: merge,
  [retryTimerTicked]: merge,
  [retryTimerCleared]: (state) => ({
    ...state,
    retryTimerId: initialState.retryTimerId,
    retryTimerSeconds: initialState.retryTimerSeconds
  }),
  [setStatusWaiting]: (state) => ({
    ...state,
    status: 'waiting'
  }),
  [setStatusConnecting]: (state) => ({
    ...state,
    status: 'connecting'
  }),
  [setStatusConnected]: (state, { accountRetriever }) => ({
    ...state,
    status: 'connected',
    accountRetriever
  }),
  [setStatusCancelled]: (state) => ({
    ...state,
    status: 'cancelled'
  }),
  [setStatusError]: (state, { error }) => ({
    ...state,
    status: 'error',
    error
  }),
  [resetAccountState]: (state) => ({
    ...state,
    accounts: initialState.accounts,
    accountPageSize: initialState.accountPageSize,
    selectedPageIndex: initialState.selectedPageIndex,
    selectedAccountIndex: initialState.selectedAccountIndex,
  }),
  [setShowAccountSelect]: merge,
  [selectedAccountIndexChanged]: merge,
  [accountPageChanged]: merge,
  [accountPageSizeChanged]: merge,
  [accountLoadStart]: mergeAccount,
  [accountLoadEnd]: mergeAccount,
}, initialState)

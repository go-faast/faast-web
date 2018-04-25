import { createReducer } from 'redux-act'
import { omit } from 'lodash'

import {
  stateReset, accountAdded, accountRemoved, connectAssetReset, derivationPathChanged, 
  connectTimeoutStarted, connectTimeoutCleared, retryTimerStarted, retryTimerTicked, retryTimerCleared,
  setStatusWaiting, setStatusConnecting, setStatusConnected, setStatusCancelled, setStatusError,
  selectedAccountChanged, accountSelectReset, connectBatchStarted, connectBatchPopped, connectBatchReset,
  accountPageChanged, accountPageSizeChanged, accountLoadStart, accountLoadSuccess, accountLoadError
} from 'Actions/connectHardwareWallet'

const initialConnectAssetState = {
  assetSymbol: '',
  status: '',
  derivationPath: undefined,
  connectTimeoutId: null,
  retryTimerId: null,
  retryTimerSeconds: 0,
}

const initialAccountSelectState = {
  accountRetriever: () => Promise.resolve(),
  accountSelectEnabled: false,
  accounts: [],
  accountPageSize: 5,
  selectedPageIndex: 0,
  selectedAccountIndex: 0,
}

const initialState = {
  walletId: '',
  walletType: '',
  connectedAccountIds: {}, // Map of assetSymbol to added account walletId
  connectBatchQueue: null,
  ...initialConnectAssetState,
  ...initialAccountSelectState,
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
  [connectBatchStarted]: merge,
  [connectBatchPopped]: (state) => ({
    ...state,
    connectBatchQueue: [...state.connectBatchQueue.slice(1)]
  }),
  [connectBatchReset]: (state) => ({
    ...state,
    connectBatchQueue: initialState.connectBatchQueue
  }),
  [accountAdded]: (state, { assetSymbol, accountId }) => ({
    ...state,
    connectedAccountIds: {
      ...state.connectedAccountIds,
      [assetSymbol]: accountId,
    }
  }),
  [accountRemoved]: (state, { assetSymbol }) => ({
    ...state,
    connectedAccountIds: omit(state.connectedAccountIds, assetSymbol)
  }),
  [connectAssetReset]: (state) => ({
    ...state,
    ...initialConnectAssetState,
    ...initialAccountSelectState,
  }),
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
  [setStatusConnecting]: (state, { walletType, assetSymbol }) => ({
    ...state,
    status: 'connecting',
    walletType,
    assetSymbol
  }),
  [setStatusWaiting]: (state) => ({
    ...state,
    status: 'waiting'
  }),
  [setStatusConnected]: (state, { accountRetriever, accountSelectEnabled }) => ({
    ...state,
    status: 'connected',
    accountRetriever,
    accountSelectEnabled
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
  [accountSelectReset]: (state) => ({
    ...state,
    ...initialAccountSelectState,
  }),
  [selectedAccountChanged]: merge,
  [accountPageChanged]: merge,
  [accountPageSizeChanged]: merge,
  [accountLoadStart]: mergeAccount,
  [accountLoadSuccess]: mergeAccount,
  [accountLoadError]: mergeAccount,
}, initialState)

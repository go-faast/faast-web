import { createAction } from 'redux-act'

import config from 'Config'
import toastr from 'Utilities/toastrWrapper'
import { timer } from 'Utilities/helpers'
import log from 'Utilities/log'
import { toMainDenomination } from 'Utilities/convert'

import web3 from 'Services/Web3'
import Trezor from 'Services/Trezor'
import { EthereumWalletLedger, EthereumWalletTrezor } from 'Services/Wallet'

import {
  getConnectTimeoutId, getRetryTimerId, getDerivationPath, getAccountRetriever,
  getAccountPageSize, getShowAccountSelect, getSelectedPageIndex
} from 'Selectors/connectHardwareWallet'

const CONNECT_RETRY_SECONDS = 10

const ACTION_TYPE_PREFIX = 'CONNECT_HARDWARE_WALLET'
const createPrefixedAction = (type, ...args) => createAction(`${ACTION_TYPE_PREFIX}/${type}`, ...args)

export const stateReset = createPrefixedAction('RESET')
export const derivationPathChanged = createPrefixedAction('DERIVATION_PATH_CHANGED', (derivationPath) => ({ derivationPath }))

export const connectTimeoutStarted = createPrefixedAction('CONNECT_TIMEOUT_STARTED', (id) => ({ connectTimeoutId: id }))
export const connectTimeoutCleared = createPrefixedAction('CONNECT_TIMEOUT_CLEARED')

export const retryTimerStarted = createPrefixedAction('RETRY_TIMER_STARTED', (id, seconds) => ({ retryTimerId: id, retryTimerSeconds: seconds }))
export const retryTimerTicked = createPrefixedAction('RETRY_TIMER_TICKED', (seconds) => ({ retryTimerSeconds: seconds }))
export const retryTimerCleared = createPrefixedAction('RETRY_TIMER_CLEARED')

export const setStatusWaiting = createPrefixedAction('SET_STATUS_WAITING')
export const setStatusConnecting = createPrefixedAction('SET_STATUS_CONNECTING')
export const setStatusConnected = createPrefixedAction('SET_STATUS_CONNECTED', (accountRetriever) => ({ accountRetriever }))
export const setStatusCancelled = createPrefixedAction('SET_STATUS_CANCELLED')
export const setStatusError = createPrefixedAction('SET_STATUS_ERROR', (message) => ({ error: message }))

export const resetAccountState = createPrefixedAction('RESET_ACCOUNTS')
export const setShowAccountSelect = createPrefixedAction('SET_SHOW_ACCOUNT_SELECT', (showAccountSelect) => ({ showAccountSelect }))
export const selectedAccountIndexChanged = createPrefixedAction('SELECTED_ACCOUNT_CHANGED', (selectedAccountIndex) => ({ selectedAccountIndex }))
export const accountPageChanged = createPrefixedAction('ACCOUNT_PAGE_CHANGED', (selectedPageIndex) => ({ selectedPageIndex }))
export const accountPageSizeChanged = createPrefixedAction('ACCOUNT_PAGE_SIZE_CHANGED', (accountPageSize) => ({ accountPageSize }))
export const accountLoadStart = createPrefixedAction('ACCOUNT_LOAD_START', (index, id) => ({ index, id }))
export const accountLoadEnd = createPrefixedAction('ACCOUNT_LOAD_END', (index, balance) => ({ index, balance }))

const clearConnectTimeout = () => (dispatch, getState) => {
  window.clearTimeout(getConnectTimeoutId(getState()))
  dispatch(connectTimeoutCleared())
}

const clearRetryTimer = () => (dispatch, getState) => {
  window.clearInterval(getRetryTimerId(getState()))
  dispatch(retryTimerCleared())
}

export const clearAsync = () => (dispatch) => {
  dispatch(clearConnectTimeout())
  dispatch(clearRetryTimer())
}

export const reset = () => (dispatch) => {
  dispatch(clearAsync())
  dispatch(stateReset())
}

export const changeDerivationPath = (path) => (dispatch) => {
  dispatch(derivationPathChanged(path))
  dispatch(resetAccountState())
}

const loadAccountBalance = (index = 0) => (dispatch, getState) => {
  const accountRetriever = getAccountRetriever(getState())
  accountRetriever(index).then((address) => Promise.all([
    dispatch(accountLoadStart(index, address)),
    web3.eth.getBalance(address)
      .then((balance) => dispatch(accountLoadEnd(index, toMainDenomination(balance, 18))))
  ]))
  .catch(log.error)
}

const loadAccountPage = (page = 0) => (dispatch, getState) => {
  const pageSize = getAccountPageSize(getState())
  const startIndex = page * pageSize
  const endIndex = startIndex + (pageSize - 1)
  for (let i = startIndex; i <= endIndex; i++) {
    dispatch(loadAccountBalance(i))
  }
}

const loadCurrentAccountPage = () => (dispatch, getState) => {
  const page = getSelectedPageIndex(getState())
  dispatch(loadAccountPage(page))
}

export const toggleShowAccountSelect = () => (dispatch, getState) => {
  const shown = !getShowAccountSelect(getState())
  dispatch(setShowAccountSelect(shown))
  if (shown) {
    dispatch(loadCurrentAccountPage())
  }
}

export const changeAccountIndex = (index = 0) => (dispatch) => {
  if (index < 0) {
    return
  }
  dispatch(selectedAccountIndexChanged(index))
}

export const changeAccountPage = (page = 0) => (dispatch) => {
  if (page < 0) {
    return
  }
  dispatch(accountPageChanged(page))
  dispatch(loadAccountPage(page))
}

const handleEthereumConnected = ({ getAddress }) => (dispatch) => {
  dispatch(setStatusConnected(getAddress))
  dispatch(loadAccountBalance(0))
}

export const connectLedgerEthereum = (derivationPath) => (dispatch) => {
  if (!window.faast.hw.ledger) {
    return toastr.error('Error: Ledger comm unavailable')
  }

  const retryConnect = () => {
    dispatch(clearRetryTimer())
    const retryTimerId = timer(CONNECT_RETRY_SECONDS, retryTimerTicked.bindTo(dispatch), tryConnect)
    dispatch(retryTimerStarted(retryTimerId, CONNECT_RETRY_SECONDS))
    dispatch(setStatusWaiting())
  }

  const ledgerError = (e) => {
    log.error(e)
    dispatch(clearConnectTimeout())
    const connectTimeoutId = window.setTimeout(retryConnect, 1000)
    dispatch(connectTimeoutStarted(connectTimeoutId))
  }

  const tryConnect = () => {
    dispatch(setStatusConnecting())

    return EthereumWalletLedger.connect(derivationPath)
      .then((result) => dispatch(handleEthereumConnected(result)))
      .catch(ledgerError)
  }
  tryConnect()
}

export const connectTrezorEthereum = (derivationPath) => (dispatch) => {
  if (!Trezor) {
    return toastr.error('Error: Trezor Connect unavailable')
  }

  const trezorError = (e) => {
    const message = e.message
    if (['cancelled', 'window closed'].includes(message.toLowerCase())) {
      dispatch(setStatusCancelled())
    } else {
      log.error(e)
      toastr.error(`Error from Trezor - ${message}`)
      dispatch(setStatusError(message))
    }
  }

  const tryConnect = () => {
    dispatch(setStatusConnecting())

    return EthereumWalletTrezor.connect(derivationPath)
      .then((result) => dispatch(handleEthereumConnected(result)))
      .catch(trezorError)
  }
  tryConnect()
}

export const connectEthereum = (type) => (dispatch, getState) => {
  if (!window.faast || !window.faast.hw) {
    return toastr.error('Error: hardware wallet support unavailable')
  }

  let derivationPath = getDerivationPath(getState())
  if (!derivationPath) {
    derivationPath = config.hdDerivationPath[type]
    dispatch(derivationPathChanged(derivationPath))
  }
  if (type === 'ledger') dispatch(connectLedgerEthereum(derivationPath))
  if (type === 'trezor') dispatch(connectTrezorEthereum(derivationPath))
}

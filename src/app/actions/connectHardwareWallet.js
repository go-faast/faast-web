import { createAction } from 'redux-act'
import { replace as routerReplace, push as routerPush } from 'react-router-redux'

import routes from 'Routes'
import config from 'Config'
import toastr from 'Utilities/toastrWrapper'
import { timer } from 'Utilities/helpers'
import log from 'Utilities/log'

import Trezor from 'Services/Trezor'
import { Wallet, EthereumWalletLedger, EthereumWalletTrezor, BitcoinWalletTrezor } from 'Services/Wallet'

import { getAsset } from 'Selectors'
import {
  getConnectTimeoutId, getRetryTimerId, getDerivationPath, getAccountRetriever, getSelectedAccountIndex,
  getAccountPageSize, getSelectedPageIndex, isStatusReset, getAssetSymbol, getWalletType,
  getConnectedAccountIds, getConnectBatchQueue
} from 'Selectors/connectHardwareWallet'

import { openWallet } from 'Actions/access'
import { removeWallet } from 'Actions/wallet'

const CONNECT_RETRY_SECONDS = 10

const ACTION_TYPE_PREFIX = 'CONNECT_HARDWARE_WALLET'
const createPrefixedAction = (type, ...args) => createAction(`${ACTION_TYPE_PREFIX}/${type}`, ...args)

export const stateReset = createPrefixedAction('RESET')

export const accountAdded = createPrefixedAction('ACCOUNT_ADDED', (assetSymbol, accountId) => ({ assetSymbol, accountId }))
export const accountRemoved = createPrefixedAction('ACCOUNT_REMOVED', (assetSymbol, accountId) => ({ assetSymbol, accountId }))
export const connectBatchStarted = createPrefixedAction('CONNECT_BATCH_STARTED', (walletType, assetSymbols) => ({ walletType, connectBatchQueue: assetSymbols }))
export const connectBatchPopped = createPrefixedAction('CONNECT_BATCH_POP')
export const connectBatchReset = createPrefixedAction('CONNECT_BATCH_RESET')

export const connectAssetReset = createPrefixedAction('CONNECT_ASSET_RESET')
export const derivationPathChanged = createPrefixedAction('DERIVATION_PATH_CHANGED', (derivationPath) => ({ derivationPath }))

export const connectTimeoutStarted = createPrefixedAction('CONNECT_TIMEOUT_STARTED', (id) => ({ connectTimeoutId: id }))
export const connectTimeoutCleared = createPrefixedAction('CONNECT_TIMEOUT_CLEARED')

export const retryTimerStarted = createPrefixedAction('RETRY_TIMER_STARTED', (id, seconds) => ({ retryTimerId: id, retryTimerSeconds: seconds }))
export const retryTimerTicked = createPrefixedAction('RETRY_TIMER_TICKED', (seconds) => ({ retryTimerSeconds: seconds }))
export const retryTimerCleared = createPrefixedAction('RETRY_TIMER_CLEARED')

export const setStatusConnecting = createPrefixedAction('SET_STATUS_CONNECTING', (walletType, assetSymbol) => ({ walletType, assetSymbol }))
export const setStatusWaiting = createPrefixedAction('SET_STATUS_WAITING')
export const setStatusConnected = createPrefixedAction('SET_STATUS_CONNECTED', (accountRetriever, accountSelectEnabled) => ({ accountRetriever, accountSelectEnabled }))
export const setStatusCancelled = createPrefixedAction('SET_STATUS_CANCELLED')
export const setStatusError = createPrefixedAction('SET_STATUS_ERROR', (message) => ({ error: message }))

export const accountSelectReset = createPrefixedAction('ASSET_SELECT_RESET')
export const selectedAccountChanged = createPrefixedAction('SELECTED_ACCOUNT_CHANGED', (selectedAccountIndex) => ({ selectedAccountIndex }))
export const accountPageChanged = createPrefixedAction('ACCOUNT_PAGE_CHANGED', (selectedPageIndex) => ({ selectedPageIndex }))
export const accountPageSizeChanged = createPrefixedAction('ACCOUNT_PAGE_SIZE_CHANGED', (accountPageSize) => ({ accountPageSize }))
export const accountLoadStart = createPrefixedAction('ACCOUNT_LOAD_START', (index, label, address) => ({ index, label, address }))
export const accountLoadSuccess = createPrefixedAction('ACCOUNT_LOAD_SUCCESS', (index, balance) => ({ index, balance }))
export const accountLoadError = createPrefixedAction('ACCOUNT_LOAD_ERROR', (index, error) => ({ index, error }))

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

export const resetConnectAsset = () => (dispatch) => {
  dispatch(clearAsync())
  dispatch(connectAssetReset())
}

export const changeDerivationPath = (path) => (dispatch) => {
  dispatch(derivationPathChanged(path))
  dispatch(accountSelectReset())
}

const loadAccountBalance = (index = 0) => (dispatch, getState) => {
  const accountRetriever = getAccountRetriever(getState())
  const assetSymbol = getAssetSymbol(getState())
  const asset = getAsset(getState(), assetSymbol)
  accountRetriever(index).then((walletInstance) => Promise.all([
    dispatch(accountLoadStart(index, walletInstance.getLabel(), walletInstance.getAddress && walletInstance.getAddress())),
    walletInstance.getBalance(asset)
      .then((balance) => dispatch(accountLoadSuccess(index, balance)))
      .catch((e) => {
        log.error(`Error loading ${assetSymbol} account #${index}`, e)
        return dispatch(accountLoadError(index, e.message))
      })
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

export const loadCurrentAccountPage = () => (dispatch, getState) => {
  const page = getSelectedPageIndex(getState())
  dispatch(loadAccountPage(page))
}

export const changeAccountIndex = (index = 0) => (dispatch) => {
  if (index < 0) {
    return
  }
  dispatch(selectedAccountChanged(index))
}

export const changeAccountPage = (page = 0) => (dispatch) => {
  if (page < 0) {
    return
  }
  dispatch(accountPageChanged(page))
  dispatch(loadAccountPage(page))
}

const createStartConnecting = (walletConnect) => (walletType, assetSymbol, errorHandler) => (dispatch, getState) => {
  dispatch(setStatusConnecting(walletType, assetSymbol))
  const derivationPath = getDerivationPath(getState())
  return walletConnect(derivationPath)
    .then((result) => {
      if (isStatusReset(getState())) {
        return
      }
      if (result instanceof Wallet) {
        dispatch(setStatusConnected(() => Promise.resolve(result), false))
      } else if (result.getAccount) {
        dispatch(setStatusConnected(result.getAccount, true))
      } else {
        throw new Error(`Invalid walletConnect result of type ${typeof result}`)
      }
      dispatch(loadAccountBalance())
      dispatch(routerPush(routes.connectHwWalletAssetConfirm(walletType, assetSymbol)))
    })
    .catch((e) => {
      if (isStatusReset(getState())) {
        return
      }
      return errorHandler(e)
    })
}

export const createConnectLedger = (startConnecting) => (walletType, assetSymbol) => (dispatch) => {
  if (!window.faast.hw.ledger) {
    return toastr.error('Error: Ledger comm unavailable')
  }

  const retryConnect = () => {
    dispatch(clearRetryTimer())
    const retryTimerId = timer(CONNECT_RETRY_SECONDS, retryTimerTicked.bindTo(dispatch), tryConnect)
    dispatch(retryTimerStarted(retryTimerId, CONNECT_RETRY_SECONDS))
    dispatch(setStatusWaiting())
  }

  const handleLedgerError = (e) => {
    log.error(e)
    dispatch(clearConnectTimeout())
    const connectTimeoutId = window.setTimeout(retryConnect, 1000)
    dispatch(connectTimeoutStarted(connectTimeoutId))
  }

  const tryConnect = () => dispatch(startConnecting(walletType, assetSymbol, handleLedgerError))

  tryConnect()
}

export const createConnectTrezor = (startConnecting) => (walletType, assetSymbol) => (dispatch) => {
  if (!Trezor) {
    return toastr.error('Error: Trezor Connect unavailable')
  }

  const handleTrezorError = (e) => {
    const message = e.message
    if (['cancelled', 'window closed'].includes(message.toLowerCase())) {
      dispatch(setStatusCancelled())
    } else {
      log.error(e)
      toastr.error(`Error from Trezor - ${message}`)
      dispatch(setStatusError(message))
    }
  }

  dispatch(startConnecting(walletType, assetSymbol, handleTrezorError))
}

const connectActions = {
  ledger: {
    ETH: createConnectLedger(createStartConnecting(EthereumWalletLedger.connect)),
  },
  trezor: {
    ETH: createConnectTrezor(createStartConnecting(EthereumWalletTrezor.connect)),
    BTC: createConnectTrezor(createStartConnecting(BitcoinWalletTrezor.fromPath)),
  },
}

export const startConnect = (walletType, assetSymbol) => (dispatch) => {
  log.debug('startConnect', walletType, assetSymbol)
  if (!window.faast || !window.faast.hw) {
    return toastr.error('Error: hardware wallet support unavailable')
  }
  const walletConfig = config.walletTypes[walletType]
  const connectWalletActions = connectActions[walletType]
  if (!(walletConfig && connectWalletActions)) {
    log.error(`Hardware wallet type ${walletType} unsupported or missing connectWalletActions`)
    return dispatch(routerReplace(routes.connect()))
  }
  const assetConfig = walletConfig.supportedAssets[assetSymbol]
  const connectAction = connectWalletActions[assetSymbol]
  if (!(assetConfig && connectAction)) {
    log.error(`Hardware wallet type ${walletType} for asset ${assetSymbol} unsupported or missing connectAction`)
    return dispatch(routerReplace(routes.connectHwWallet(walletType)))
  }
  dispatch(accountSelectReset())
  dispatch(derivationPathChanged(assetConfig.derivationPath))
  dispatch(setStatusConnecting(walletType, assetSymbol))
  dispatch(routerPush(routes.connectHwWalletAsset(walletType, assetSymbol)))
  // Delay connect until at least after Modal transition
  window.setTimeout(() => dispatch(connectAction(walletType, assetSymbol)), 1000)
}

export const retryConnect = () => (dispatch, getState) => {
  const walletType = getWalletType(getState())
  const assetSymbol = getAssetSymbol(getState())
  if (!walletType || !assetSymbol) {
    log.debug('Cant retry, walletType or assetSymbol unspecified', { walletType, assetSymbol })
    return
  }
  const connectAction = connectActions[walletType][assetSymbol]
  dispatch(clearAsync())
  dispatch(connectAction(walletType, assetSymbol))
}

export const cancelConnect = () => (dispatch, getState) => {
  const walletType = getWalletType(getState())
  if (walletType === 'trezor') {
    Trezor.close()
  }
  dispatch(resetConnectBatch())
  dispatch(routerPush(routes.connectHwWallet(walletType)))
}

export const connectNext = () => (dispatch, getState) => {
  const walletType = getWalletType(getState())
  const batchQueue = getConnectBatchQueue(getState())
  if (batchQueue) {
    const nextSymbol = batchQueue[0]
    if (nextSymbol) {
      dispatch(connectBatchPopped())
      dispatch(startConnect(walletType, nextSymbol))
    } else {
      dispatch(routerPush(routes.dashboard()))
    }
  } else {
    dispatch(routerPush(routes.connectHwWallet(walletType)))
  }
}

export const startConnectBatch = (walletType, assetSymbols) => (dispatch) => {
  dispatch(connectBatchStarted(walletType, assetSymbols))
  dispatch(connectNext())
}

export const resetConnectBatch = () => (dispatch) => {
  dispatch(connectBatchReset())
}

export const confirmAccountSelection = () => (dispatch, getState) => {
  const assetSymbol = getAssetSymbol(getState())
  const selectedAccountIndex = getSelectedAccountIndex(getState())
  const accountRetriever = getAccountRetriever(getState())
  accountRetriever(selectedAccountIndex).then((walletInstance) => {
    dispatch(openWallet(walletInstance))
    dispatch(accountAdded(assetSymbol, walletInstance.getId()))
    dispatch(connectNext())
  })
}

export const removeConnectedAccount = (assetSymbol) => (dispatch, getState) => {
  const connectedAccountIds = getConnectedAccountIds(getState())
  const accountId = connectedAccountIds[assetSymbol]
  if (!accountId) {
    log.debug(`No connected account to remove for ${assetSymbol}`)
    return
  }
  dispatch(removeWallet(accountId))
  dispatch(accountRemoved(assetSymbol))
}

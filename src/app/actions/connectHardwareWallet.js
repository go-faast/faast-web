import { replace as routerReplace, push as routerPush } from 'react-router-redux'

import routes from 'Routes'
import config from 'Config'
import { newScopedCreateAction } from 'Utilities/action'
import toastr from 'Utilities/toastrWrapper'
import { timer, mapValues } from 'Utilities/helpers'
import log from 'Utilities/log'

import Trezor from 'Services/Trezor'
import Ledger from 'Services/Ledger'
import walletService, {
  Wallet, MultiWallet, MultiWalletLedger, MultiWalletTrezor,
  EthereumWalletLedger, EthereumWalletTrezor,
  BitcoinWalletLedger, BitcoinWalletTrezor,
  BitcoinCashWalletLedger, BitcoinCashWalletTrezor,
  LitecoinWalletLedger, LitecoinWalletTrezor,
} from 'Services/Wallet'

import { getAsset } from 'Selectors'
import {
  getConnectTimeoutId, getRetryTimerId, getDerivationPath, getAccountRetriever, getSelectedAccountIndex,
  getAccountPageSize, getSelectedPageIndex, isStatusReset, getAssetSymbol, getWalletType, getWalletId,
  getConnectedAccountIds, getConnectBatchQueue
} from 'Selectors/connectHardwareWallet'

import { openWallet } from 'Actions/access'
import { addWallet, removeWallet, addNestedWallets, updateWallet } from 'Actions/wallet'

const CONNECT_RETRY_SECONDS = 10

const multiWalletTypes = {
  ledger: MultiWalletLedger,
  trezor: MultiWalletTrezor,
}

const createAction = newScopedCreateAction(__filename)

export const stateReset = createAction('RESET')

export const setWalletId = createAction('SET_WALLET_ID', (walletId) => ({ walletId }))
export const accountAdded = createAction('ACCOUNT_ADDED', (assetSymbol, accountId) => ({ assetSymbol, accountId }))
export const accountRemoved = createAction('ACCOUNT_REMOVED', (assetSymbol, accountId) => ({ assetSymbol, accountId }))
export const connectBatchStarted = createAction('CONNECT_BATCH_STARTED', (walletType, assetSymbols) => ({ walletType, connectBatchQueue: assetSymbols }))
export const connectBatchPopped = createAction('CONNECT_BATCH_POP')
export const connectBatchReset = createAction('CONNECT_BATCH_RESET')

export const connectAssetReset = createAction('CONNECT_ASSET_RESET')
export const derivationPathChanged = createAction('DERIVATION_PATH_CHANGED', (derivationPath) => ({ derivationPath }))

export const connectTimeoutStarted = createAction('CONNECT_TIMEOUT_STARTED', (id) => ({ connectTimeoutId: id }))
export const connectTimeoutCleared = createAction('CONNECT_TIMEOUT_CLEARED')

export const retryTimerStarted = createAction('RETRY_TIMER_STARTED', (id, seconds) => ({ retryTimerId: id, retryTimerSeconds: seconds }))
export const retryTimerTicked = createAction('RETRY_TIMER_TICKED', (seconds) => ({ retryTimerSeconds: seconds }))
export const retryTimerCleared = createAction('RETRY_TIMER_CLEARED')

export const setStatusConnecting = createAction('SET_STATUS_CONNECTING', (walletType, assetSymbol) => ({ walletType, assetSymbol }))
export const setStatusWaiting = createAction('SET_STATUS_WAITING')
export const setStatusConnected = createAction('SET_STATUS_CONNECTED', (accountRetriever, accountSelectEnabled) => ({ accountRetriever, accountSelectEnabled }))
export const setStatusCancelled = createAction('SET_STATUS_CANCELLED')
export const setStatusError = createAction('SET_STATUS_ERROR', (message) => ({ error: message }))

export const accountSelectReset = createAction('ASSET_SELECT_RESET')
export const selectedAccountChanged = createAction('SELECTED_ACCOUNT_CHANGED', (selectedAccountIndex) => ({ selectedAccountIndex }))
export const accountPageChanged = createAction('ACCOUNT_PAGE_CHANGED', (selectedPageIndex) => ({ selectedPageIndex }))
export const accountPageSizeChanged = createAction('ACCOUNT_PAGE_SIZE_CHANGED', (accountPageSize) => ({ accountPageSize }))
export const accountLoadStart = createAction('ACCOUNT_LOAD_START', (index, label, address) => ({ index, label, address }))
export const accountLoadSuccess = createAction('ACCOUNT_LOAD_SUCCESS', (index, balance) => ({ index, balance }))
export const accountLoadError = createAction('ACCOUNT_LOAD_ERROR', (index, error) => ({ index, error }))

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
  dispatch(retryConnect())
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

const createStartConnecting = (walletFactory) => (walletType, assetSymbol, errorHandler) => (dispatch, getState) => {
  dispatch(setStatusConnecting(walletType, assetSymbol))
  const derivationPath = getDerivationPath(getState())
  return walletFactory(derivationPath)
    .then((result) => {
      if (isStatusReset(getState())) {
        return
      }
      if (result instanceof Wallet) {
        dispatch(setStatusConnected(() => Promise.resolve(result), false))
      } else if (result.getAccount) {
        dispatch(setStatusConnected(result.getAccount, true))
      } else {
        throw new Error(`Invalid walletFactory result of type ${typeof result}`)
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
  if (!Ledger) {
    return toastr.error('Error: Ledger service unavailable')
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
  ledger: mapValues({
    ETH: EthereumWalletLedger.connect,
    BTC: BitcoinWalletLedger.fromPath,
    BCH: BitcoinCashWalletLedger.fromPath,
    LTC: LitecoinWalletLedger.fromPath,
  }, (connectFn) => createConnectLedger(createStartConnecting(connectFn))),
  trezor: mapValues({
    ETH: EthereumWalletTrezor.connect,
    BTC: BitcoinWalletTrezor.fromPath,
    BCH: BitcoinCashWalletTrezor.fromPath,
    LTC: LitecoinWalletTrezor.fromPath,
  }, (connectFn) => createConnectTrezor(createStartConnecting(connectFn))),
}

export const startConnect = (walletType, assetSymbol) => (dispatch) => {
  log.debug('startConnect', walletType, assetSymbol)
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
  dispatch(clearAsync())
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
      dispatch(saveConnectedAccounts())
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
    walletInstance.setPersistAllowed(false)
    dispatch(addWallet(walletInstance))
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

export const saveConnectedAccounts = () => (dispatch, getState) => {
  const connectedAccountIds = Object.values(getConnectedAccountIds(getState()))
  if (!connectedAccountIds.length) {
    return toastr.error('No accounts are connected')
  }
  let multiWalletId = getWalletId(getState())
  let multiWalletPromise
  if (multiWalletId) {
    const multiWallet = walletService.get(multiWalletId)
    if (!multiWallet) {
      return toastr.error(`Unknown wallet ${multiWalletId}`)
    }
    if (!(multiWallet instanceof MultiWallet)) {
      return toastr.error(`Not a MultiWallet ${multiWalletId}`)
    }
    multiWalletPromise = Promise.resolve(multiWallet)
  } else {
    const walletType = getWalletType(getState())
    const MultiWalletType = multiWalletTypes[walletType]
    if (!MultiWalletType) {
      return toastr.error(`Missing save configuration for ${walletType}`)
    }
    const multiWallet = new MultiWalletType()
    multiWalletId = multiWallet.getId()
    multiWalletPromise = dispatch(openWallet(multiWallet)).then(() => multiWallet)
  }
  return multiWalletPromise
    .then(() => Promise.all(
      connectedAccountIds.map((connectedAccountId) => {
        const walletInstance = walletService.get(connectedAccountId)
        walletInstance.setPersistAllowed(true)
        return dispatch(updateWallet(connectedAccountId))
      })
    ))
    .then(() => dispatch(addNestedWallets(multiWalletId, ...connectedAccountIds)))
    .then(() => dispatch(routerPush(routes.dashboard())))
}

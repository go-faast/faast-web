import qs from 'query-string'
import { newScopedCreateAction } from 'Utilities/action'
import { localStorageGetJson, sessionStorageSet, localStorageSet, localStorageGet } from 'Utilities/storage'
import blockstack from 'Utilities/blockstack'
import { filterUrl } from 'Utilities/helpers'
import log from 'Utilities/log'
import { restoreCachedAffiliateInfo } from 'Actions/affiliate'
import walletService from 'Services/Wallet'

import { retrieveAssets, restoreAssets } from './asset'
import { setSettings } from './settings'
import { restoreAllPortfolios, updateAllHoldings } from './portfolio'
import { restoreTxs } from './tx'
import { retrieveAllSwaps, restoreSwapTxIds, restoreSwapPolling } from './swap'
import { fetchGeoRestrictions, languageLoad } from 'Common/actions/app'
import { setCurrencySymbol } from './currency'
import { currencies } from 'Config/currencies'

import { getTradeableAssetFilter } from 'Selectors/app'

export * from 'Common/actions/app'

const createAction = newScopedCreateAction(__filename)

export const appReady = createAction('READY')
export const appError = createAction('ERROR')
export const updateConnectForwardUrl = createAction('UPDATE_CONNECT_FORWARD_URL')
export const resetAll = createAction('RESET_ALL')
export const updateAssetsFilterByTradeable = createAction('UPDATE_ASSETS_TRADEABLE_FILTER')
export const updateRememberWallets = createAction('UPDATE_REMEMBER_WALLES')

export const restoreState = (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(restoreRememberWallets())
    dispatch(toggleAssetsByTradeable())
    dispatch(restoreCachedAffiliateInfo())
    dispatch(languageLoad())
    dispatch(currencyLoad())
    const assetCache = localStorageGetJson('state:asset')
    if (assetCache) {
      dispatch(restoreAssets(assetCache))
      dispatch(retrieveAssets()) // Retrieve updated assets in background
    } else {
      return dispatch(retrieveAssets()) // asset list required to restore wallets
    }
  })
  .then(() => dispatch(restoreAllPortfolios()))
  .then(() => {
    dispatch(updateAllHoldings())
    const txState = localStorageGetJson('state:tx')
    if (txState) {
      dispatch(restoreTxs(txState))
    }
    return dispatch(retrieveAllSwaps())
  })
  .then((retrievedSwaps) => {
    const swapTxIds = localStorageGetJson('state:swap-txId')
    if (swapTxIds) {
      dispatch(restoreSwapTxIds(swapTxIds))
    }
    retrievedSwaps.forEach(({ orderId }) => dispatch(restoreSwapPolling(orderId)))
  })
  .catch((e) => {
    log.error(e)
    throw new Error('Error loading app: ' + e.message)
  })

export const restoreRememberWallets = () => (dispatch) => {
  let rememberWallets = localStorageGet('remember_wallets') || 'local'
  localStorageSet('remember_wallets', rememberWallets)
  dispatch(updateRememberWallets(rememberWallets))
}

export const handleRememberWallets = (type) => (dispatch) => {
  localStorageSet('remember_wallets', type)
  walletService.switchBetweenStorage(type)
  dispatch(updateRememberWallets(type))
}

export const currencyLoad = () => (dispatch) => {
  let currency = localStorageGetJson('currency_symbol') || currencies[0]
  dispatch(setCurrencySymbol(currency))
}

export const setupBlockstack = (dispatch) => Promise.resolve()
  .then(() => {
    if (blockstack.isSignInPending()) {
      log.info('blockstack signin pending')
      return blockstack.handlePendingSignIn()
        .then(() => typeof window !== 'undefined' && window.location.replace(filterUrl()))
    }
  })
  .then(() => {
    if (blockstack.isUserSignedIn()) {
      return blockstack.getSettings()
        .then((settings) => dispatch(setSettings(settings)))
    }
  })
  .catch((e) => {
    log.error('Failed to setup Blockstack', e)
  })

export const toggleAssetsByTradeable = () => (dispatch, getState) => Promise.resolve()
  .then(() => {
    let filter = getTradeableAssetFilter(getState())
    filter = typeof filter !== 'undefined' ? !filter : (localStorageGet('filterTradeableAssets') == 'true')
    localStorageSet('filterTradeableAssets', filter)
    dispatch(updateAssetsFilterByTradeable(filter))
  })

export const updateConnectForward = (url) => (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(updateConnectForwardUrl(url))
  })

export const setupAffiliateReferral = () => Promise.resolve()
  .then(() => {
    let query
    if (typeof window !== 'undefined') {
      query = qs.parse(window.location.search, { ignoreQueryPrefix: true })
    }
    if (typeof query.aid === 'string') {
      sessionStorageSet('affiliateId', query.aid)
    } else if (typeof query.ref === 'string' && query.ref !== 'producthunt') {
      sessionStorageSet('affiliateId', query.ref)
    }
  })
  .catch((e) => {
    log.error('Failed to setup affiliate referral', e)
  })

export const init = () => (dispatch) => Promise.resolve()
  .then(() => dispatch(fetchGeoRestrictions()))
  .then(() => dispatch(restoreState))
  .then(() => dispatch(setupBlockstack))
  .then(() => dispatch(appReady()))
  .then(() => setupAffiliateReferral())
  .catch((e) => {
    log.error(e)
    const message = e.message || 'Unknown error'
    dispatch(appError(message))
  })

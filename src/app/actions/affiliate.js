import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import { sessionStorageSet, sessionStorageSetJson, sessionStorageGetJson, 
  sessionStorageGet, sessionStorageClear } from 'Utilities/storage'

import { isAffiliateLoggedIn, isAffiliateDataStale } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const affiliateDataUpdated = createAction('AFFILIATE_UPDATED')
export const login = createAction('LOGIN')
export const logout = createAction('LOGOUT')
export const loginError = createAction('LOGIN_ERROR')
export const updateAffiliateId = createAction('UPDATE_ID')
export const updateSecretKey = createAction('UPDATE_KEY')
export const updateBalance = createAction('UPDATE_BALANCE')
export const updateMinimumWithdrawal = createAction('UPDATE_MINIMUM_WITHDRAWAL')
export const updateBalanceSwaps = createAction('UPDATE_BALANCE_SWAPS')
export const resetAffiliate = createAction('RESET_ALL')
export const statsRetrieved = createAction('STATS_RETRIEVED')
export const updateSwapExportLink = createAction('UPDATE_SWAP_EXPORT_LINK')
export const swapExportLinkLoading = createAction('SWAP_EXPORT_LINK_LOADING')
export const withdrawalsRetrieved = createAction('WITHDRAWALS_RETRIEVED')
export const withdrawalsTotalUpdated = createAction('WITHDRAWAL_HISTORY_TOTAL_UPDATED')
export const withdrawalsLoading = createAction('WITHDRAWALS_LOADING')
export const swapsRetrieved = createAction('SWAPS_RETRIEVED')
export const swapsError = createAction('SWAPS_RETRIEVED')
export const swapsLoading = createAction('SWAPS_LOADING')
export const swapChartLoading = createAction('SWAP_CHART_LOADING')
export const statsError = createAction('STATS_ERROR')
export const withdrawalsError = createAction('WITHDRAWALS_ERROR')
export const swapHistoryTotalUpdated = createAction('SWAP_HISTORY_TOTAL_UPDATED')

export const getStats = (id, key) => (dispatch) => {
  return Faast.getAffiliateStats(id, key)
    .then(({ totals, affiliate_id }) => {
      sessionStorageSet('state:affiliate_id', affiliate_id)
      sessionStorageSet('state:affiliate_key', key)
      sessionStorageSetJson('state:affiliate_stats', totals)
      dispatch(updateAffiliateId(id))
      dispatch(updateSecretKey(key))
      dispatch(statsRetrieved(totals))
    })
    .catch((e) => { 
      dispatch(statsError(e))
    })
}

export const affiliateLogin = (id, key) => (dispatch) => {
  dispatch(getAccountDetails(id, key))
    .then(() => {
      dispatch(affiliateDataUpdated())
      dispatch(getAffiliateWithdrawals(id, key))
      dispatch(getAffiliateSwaps(id, key, 1, 5))
      dispatch(getBalance(id, key))
      dispatch(getStats(id, key))
      dispatch(dispatch(login()))
      sessionStorageSet('state:affiliate_lastUpdated', Date.now())
    })
}

export const getBalance = (id, key) => (dispatch) => {
  return Faast.getAffiliateBalance(id, key)
    .then(({ balance, swaps, minimum_withdrawal }) => {
      sessionStorageSet('state:affiliate_balance', balance)
      sessionStorageSet('state:affiliate_balance_swaps', swaps)
      dispatch(updateBalance(balance))
      dispatch(updateMinimumWithdrawal(minimum_withdrawal))
      return dispatch(updateBalanceSwaps(swaps))
    })
    .catch((e) => e)
}

export const getSwapsExportLink = (id, key) => (dispatch) => {
  dispatch(swapExportLinkLoading())
  return Faast.getAffiliateExportLink(id, key)
    .then((result) => {
      return dispatch(updateSwapExportLink(result.url))
    })
    .catch((e) => e)
}

export const getAccountDetails = (id, key) => (dispatch) => {
  return Faast.getAffiliateAccount(id, key)
    .then((account) => {
      return account
    })
    .catch(() => { 
      dispatch(loginError())
      toastr.error('Affiliate ID or Secret Key is incorrect')
      throw new Error()
    })
}

export const getAffiliateWithdrawals = (id, key, page, limit) => (dispatch) => {
  dispatch(withdrawalsLoading())
  return Faast.getAffiliateSwapPayouts(id, key, page, limit)
    .then((response) => {
      dispatch(dispatch(withdrawalsTotalUpdated(response.total)))
      sessionStorageSetJson('state:affiliate_withdrawals', response.withdrawals)
      return dispatch(withdrawalsRetrieved(response.withdrawals))
    })
    .catch((e) => dispatch(withdrawalsError(e)))
}

export const getAffiliateSwaps = (id, key, page, limit) => (dispatch) => {
  dispatch(swapsLoading())
  return Faast.getAffiliateSwaps(id, key, page, limit)
    .then((swaps) => {
      dispatch(swapHistoryTotalUpdated(swaps.total))
      sessionStorageSetJson('state:swap_history_total', swaps.total)
      swaps = swaps.orders.map(Faast.formatOrderResult)
      sessionStorageSetJson('state:affiliate_swaps', swaps)
      return dispatch(swapsRetrieved(swaps))
    })
    .catch((e) => dispatch(swapsError(e)))
}

export const restoreCachedAffiliateInfo = () => (dispatch, getState) => {
  const cachedAffiliateId = sessionStorageGet('state:affiliate_id')
  const cachedAffiliateKey = sessionStorageGet('state:affiliate_key')
  const cachedAffiliateStats = sessionStorageGetJson('state:affiliate_stats')
  const cachedAffiliateWithdrawals = sessionStorageGetJson('state:affiliate_withdrawals')
  const cachedAffiliateSwaps = sessionStorageGetJson('state:affiliate_swaps')
  const cachedAffiliateBalance = sessionStorageGetJson('state:affiliate_balance')
  const cachedAffiliateBalanceSwaps = sessionStorageGetJson('state:affiliate_balance_swaps')
  const cachedLastUpdated = sessionStorageGet('state:affiliate_lastUpdated')
  const cachedSwapHistoryTotal = sessionStorageGet('state:swap_history_total')
  if (cachedAffiliateId && cachedAffiliateStats && cachedAffiliateWithdrawals 
    && cachedAffiliateKey && cachedAffiliateBalance && cachedAffiliateBalanceSwaps 
    && cachedAffiliateSwaps && cachedSwapHistoryTotal) {
    dispatch(updateAffiliateId(cachedAffiliateId))
    dispatch(statsRetrieved(cachedAffiliateStats))
    dispatch(withdrawalsRetrieved(cachedAffiliateWithdrawals))
    dispatch(swapsRetrieved(cachedAffiliateSwaps))
    dispatch(updateSecretKey(cachedAffiliateKey))
    dispatch(updateBalance(cachedAffiliateBalance))
    dispatch(updateBalanceSwaps(cachedAffiliateBalanceSwaps))
    dispatch(dispatch(login()))
    dispatch(affiliateDataUpdated(parseInt(cachedLastUpdated)))
    dispatch(swapHistoryTotalUpdated(parseInt(cachedSwapHistoryTotal)))
    if (isAffiliateDataStale(getState())) {
      return dispatch(affiliateLogin(cachedAffiliateId, cachedAffiliateKey))
    }
    return
  }
  else if (isAffiliateLoggedIn(getState())) {
    return dispatch(affiliateLogout())
  } 
  return
}

export const affiliateLogout = () => (dispatch) => {
  sessionStorageClear()
  dispatch(resetAffiliate())
  dispatch(dispatch(logout()))
  return dispatch(push('/affiliates/login'))
}

export const register = (id, address, email) => (dispatch) => {
  return Faast.affiliateRegister(id, address, email)
    .then(({ affiliate_id, secret }) => {
      dispatch(affiliateLogin(affiliate_id, secret))
      return dispatch(push('/affiliates/dashboard/account'))
    })
    .catch(() => toastr.error('There was an error registering. Please try again.'))
}
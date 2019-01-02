import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import { sessionStorageSet, sessionStorageSetJson, sessionStorageGetJson, 
  sessionStorageGet, sessionStorageClear } from 'Utilities/storage'
import { formatDate } from 'Utilities/display'

import { isAffiliateLoggedIn, isAffiliateDataStale } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const affiliateDataUpdated = createAction('AFFILIATE_UPDATED')
export const login = createAction('LOGIN')
export const logout = createAction('LOGOUT')
export const loginError = createAction('LOGIN_ERROR')
export const updateAffiliateId = createAction('UPDATE_ID')
export const updateSecretKey = createAction('UPDATE_KEY')
export const updateBalance = createAction('UPDATE_BALANCE')
export const updateBalanceSwaps = createAction('UPDATE_BALANCE_SWAPS')
export const updateSwapsChart = createAction('UPDATE_SWAPS_CHART')
export const resetAffiliate = createAction('RESET_ALL')
export const statsRetrieved = createAction('STATS_RETRIEVED')
export const withdrawalsRetrieved = createAction('WITHDRAWALS_RETRIEVED')
export const swapsRetrieved = createAction('SWAPS_RETRIEVED')
export const swapsError = createAction('SWAPS_RETRIEVED')
export const swapsLoading = createAction('SWAPS_LOADING')
export const swapChartLoading = createAction('SWAP_CHART_LOADING')
export const statsError = createAction('STATS_ERROR')
export const withdrawalsError = createAction('WITHDRAWALS_ERROR')

export const getStats = (id, key) => (dispatch, getState) => {
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
      if (!isAffiliateLoggedIn(getState())) {
        dispatch(loginError())
        toastr.error('Affiliate ID or Secret Key is incorrect')
      }
      dispatch(statsError(e))
    })
}

export const affiliateLogin = (id, key) => (dispatch) => {
  dispatch(affiliateDataUpdated())
  dispatch(getAffiliateWithdrawals(id, key))
  dispatch(getAffiliateSwaps(id))
  dispatch(getBalance(id, key))
  dispatch(getStats(id, key))
  dispatch(getAccountDetails(id, key))
  sessionStorageSet('state:affiliate_lastUpdated', Date.now())
  return dispatch(dispatch(login()))
}

export const getBalance = (id, key) => (dispatch, getState) => {
  return Faast.getAffiliateBalance(id, key)
    .then(({ balance, swaps }) => {
      sessionStorageSet('state:affiliate_balance', balance)
      sessionStorageSet('state:affiliate_balance_swaps', swaps)
      dispatch(updateBalance(balance))
      return dispatch(updateBalanceSwaps(swaps))
    })
    .catch(() => { 
      if (!isAffiliateLoggedIn(getState())) {
        dispatch(loginError())
      }
    })
}

export const getAccountDetails = (id, key) => (dispatch, getState) => {
  return Faast.getAffiliateAccount(id, key)
    .then((account) => {
      return console.log(account)
    })
    .catch(() => { 
      if (!isAffiliateLoggedIn(getState())) {
        dispatch(loginError())
      }
    })
}

export const getAffiliateWithdrawals = (id, key) => (dispatch) => {
  return Faast.getAffiliateSwapPayouts(id, key)
    .then((withdrawals) => {
      sessionStorageSetJson('state:affiliate_withdrawals', withdrawals.records)
      return dispatch(withdrawalsRetrieved(withdrawals.records))
    })
    .catch((e) => dispatch(withdrawalsError(e)))
}

export const getAffiliateSwaps = (id) => (dispatch) => {
  dispatch(swapsLoading())
  return Faast.getAffiliateSwaps(id)
    .then((swaps) => {
      const totalPages = Math.ceil(swaps.total / swaps.limit)
      swaps = swaps.orders.map(Faast.formatOrderResult)
      sessionStorageSetJson('state:affiliate_swaps', swaps)
      //dispatch(getSwapsChart(id, totalPages))
      return dispatch(swapsRetrieved(swaps))
    })
    .catch((e) => dispatch(swapsError(e)))
}

export const getSwapsChart = (id, totalPages) => (dispatch) => {
  dispatch(swapChartLoading())
  for (var i = 1; i <= totalPages; i++) {
    Faast.getAffiliateSwaps(id, i)
      .then((swaps) => {
        let data = []
        swaps.orders.map((order) => {
          let orderData = { name: '', data: [] }
          orderData.name = order.created_at
          orderData.data.push(1)
          data.push(orderData)
        })
        let swaps_chart = JSON.parse(sessionStorageGet('state:swaps_chart')) || []
        data = swaps_chart.concat(data)
        sessionStorageSet('state:swaps_chart', JSON.stringify(data))
        if (i >= totalPages) {
          console.log('yo')
          return dispatch(updateSwapsChart(data.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)))
        }
      })
      .catch((e) => dispatch(swapsError(e)))
  }
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
  const cachedSwapsChartData = sessionStorageGet('state:swaps_chart')
  if (cachedAffiliateId && cachedAffiliateStats && cachedAffiliateWithdrawals 
    && cachedAffiliateKey && cachedAffiliateBalance && cachedAffiliateBalanceSwaps 
    && cachedAffiliateSwaps && cachedSwapsChartData) {
    dispatch(updateAffiliateId(cachedAffiliateId))
    dispatch(statsRetrieved(cachedAffiliateStats))
    dispatch(withdrawalsRetrieved(cachedAffiliateWithdrawals))
    dispatch(swapsRetrieved(cachedAffiliateSwaps))
    dispatch(updateSecretKey(cachedAffiliateKey))
    dispatch(updateBalance(cachedAffiliateBalance))
    dispatch(updateBalanceSwaps(cachedAffiliateBalanceSwaps))
    dispatch(updateSwapsChart(cachedSwapsChartData))
    dispatch(dispatch(login()))
    dispatch(affiliateDataUpdated(parseInt(cachedLastUpdated)))
    if (isAffiliateDataStale(getState())) {
      return dispatch(affiliateLogin(cachedAffiliateId, cachedAffiliateKey))
    }
    return
  }
  else {
    return dispatch(affiliateLogout())
  }
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
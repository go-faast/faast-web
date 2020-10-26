import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import { sessionStorageSet, sessionStorageSetJson, sessionStorageGetJson, 
  sessionStorageGet, sessionStorageClear, localStorageSet, localStorageGet } from 'Utilities/storage'

import { isMakerLoggedIn, isMakerDataStale } from 'Selectors/maker'

const createAction = newScopedCreateAction(__filename)

export const makerDataUpdated = createAction('MAKER_UPDATED')
export const login = createAction('MAKER_LOGIN')
export const loadingLogin = createAction('MAKER_LOADING_LOGIN')
// export const updateAffiliateTerms = createAction('ACCEPT_TERMS')
export const logout = createAction('MAKER_LOGOUT')
export const loginError = createAction('MAKER_LOGIN_ERROR')
export const updateMakerId = createAction('MAKER_UPDATE_ID')
export const updateSecretKey = createAction('UPDATE_KEY')
export const updateProfile = createAction('UPDATE_MAKER_PROFILE')
export const resetMaker = createAction('MAKER_RESET_ALL')
export const statsRetrieved = createAction('STATS_RETRIEVED')
export const swapsRetrieved = createAction('SWAPS_RETRIEVED')
export const swapsError = createAction('SWAPS_RETRIEVED')
export const swapsLoading = createAction('SWAPS_LOADING')
export const statsError = createAction('STATS_ERROR')
export const swapHistoryTotalUpdated = createAction('SWAP_HISTORY_TOTAL_UPDATED')

export const getStats = (id, key) => (dispatch) => {
  return Faast.getAffiliateStats(id, key)
    .then(({ totals, affiliate_id }) => {
      sessionStorageSet('state:maker_id', affiliate_id)
      sessionStorageSet('state:maker_key', key)
      sessionStorageSetJson('state:maker_stats', totals)
      dispatch(updateSecretKey(key))
      dispatch(statsRetrieved(totals))
    })
    .catch((e) => { 
      dispatch(statsError(e))
    })
}

export const makerLogin = (id, key) => (dispatch, getState) => {
  dispatch(getAccountDetails(id, key))
    .then(() => {
      dispatch(push('/makers/dashboard'))
      dispatch(loadingLogin())
      Promise.all([
        dispatch(getMakerSwaps(id, key, 1, 5)),
        dispatch(getMakerProfile(id, key)),
        dispatch(getStats(id, key))
      ]).then(() => {
        dispatch(login())
        dispatch(makerDataUpdated())
        sessionStorageSet('state:maker_lastUpdated', Date.now())
      }).catch(() => { throw new Error('Unable to Login') })
    })
}

export const getMakerProfile = (id, key) => (dispatch) => {
  return Faast.getAffiliateBalance(id, key)
    .then(({ profile }) => {
      sessionStorageSet('state:maker_profile', profile)
      return dispatch(updateProfile(profile))
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
      toastr.error('Maker ID or Secret Key is incorrect')
      throw new Error()
    })
}

export const getMakerSwaps = (id, key, page, limit) => (dispatch) => {
  dispatch(swapsLoading())
  return Faast.getAffiliateSwaps(id, key, page, limit)
    .then((swaps) => {
      dispatch(swapHistoryTotalUpdated(swaps.total))
      console.log(swaps)
      sessionStorageSetJson('state:maker_swap_history_total', swaps.total)
      swaps = swaps.orders.map(Faast.formatOrderResult)
      sessionStorageSetJson('state:maker_swaps', swaps)
      return dispatch(swapsRetrieved(swaps))
    })
    .catch((e) => dispatch(swapsError(e)))
}

export const restoreCachedMakerInfo = () => (dispatch, getState) => {
  const cachedMakerId = sessionStorageGet('state:maker_id')
  const cachedMakerKey = sessionStorageGet('state:maker_key')
  const cachedMakerStats = sessionStorageGetJson('state:maker_stats')
  const cachedMakerSwaps = sessionStorageGetJson('state:maker_swaps')
  const cachedMakerProfile = sessionStorageGetJson('state:maker_profile')
  const cachedLastUpdated = sessionStorageGet('state:maker_lastUpdated')
  if (cachedMakerId && cachedMakerStats && cachedMakerKey && cachedMakerSwaps) {
    dispatch(updateMakerId(cachedMakerId))
    dispatch(statsRetrieved(cachedMakerStats))
    dispatch(swapsRetrieved(cachedMakerSwaps))
    dispatch(updateSecretKey(cachedMakerKey))
    dispatch(updateProfile(cachedMakerProfile))
    dispatch(dispatch(login()))
    dispatch(makerDataUpdated(parseInt(cachedLastUpdated)))
    if (isMakerDataStale(getState())) {
      return dispatch(makerLogin(cachedMakerId, cachedMakerKey))
    }
    return
  }
  else if (isMakerLoggedIn(getState())) {
    return dispatch(makerLogout())
  } 
  return
}

export const makerLogout = () => (dispatch) => {
  sessionStorageClear()
  dispatch(resetMaker())
  dispatch(dispatch(logout()))
  return dispatch(push('/maker/login'))
}

export const register = (id, address, email) => (dispatch) => {
  return Faast.affiliateRegister(id, address, email)
    .then(({ affiliate_id, secret }) => {
      dispatch(makerLogin(affiliate_id, secret))
      return dispatch(push('/maker/dashboard/account'))
    })
    .catch(() => toastr.error('There was an error registering. Please try again.'))
}
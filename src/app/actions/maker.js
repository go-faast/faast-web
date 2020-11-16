import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import Faast from 'Services/Faast'
import { getSession, clearSession } from 'Services/Auth'
import { sessionStorageSet, sessionStorageSetJson, sessionStorageGetJson, 
  sessionStorageGet, sessionStorageClear, localStorageSet, localStorageGet } from 'Utilities/storage'

import { isMakerLoggedIn, isMakerDataStale } from 'Selectors/maker'

const createAction = newScopedCreateAction(__filename)

export const makerDataUpdated = createAction('MAKER_UPDATED')
export const login = createAction('MAKER_LOGIN')
export const loadingData = createAction('MAKER_LOADING_LOGIN')
export const loginError = createAction('MAKER_LOGIN_ERROR')
export const updateProfile = createAction('UPDATE_MAKER_PROFILE')
export const updateBalances = createAction('UPDATE_MAKER_BALANCES')
export const resetMaker = createAction('MAKER_RESET_ALL')
export const statsRetrieved = createAction('STATS_RETRIEVED')
export const swapsRetrieved = createAction('SWAPS_RETRIEVED')
export const swapsError = createAction('SWAPS_RETRIEVED')
export const swapsLoading = createAction('SWAPS_LOADING')
export const statsError = createAction('STATS_ERROR')
export const swapHistoryTotalUpdated = createAction('SWAP_HISTORY_TOTAL_UPDATED')

const getMakerAccessToken = () => (dispatch) => {
  const accessToken = getSession().accessToken
  if (accessToken) {
    return accessToken
  } else {
    dispatch(push('/makers/login'))
  }
}

export const getStats = (accessToken) => (dispatch) => {
  return Faast.getMakerStatistics(accessToken)
    .then((stats) => {
      sessionStorageSetJson('state:maker_stats', stats)
      dispatch(statsRetrieved(stats))
    })
    .catch((e) => { 
      dispatch(statsError(e))
    })
}

export const getAllMakerData = () => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  dispatch(getMakerProfile(accessToken))
    .then(() => {
      Promise.all([
        dispatch(getMakerSwaps(accessToken, 1, 5)),
        dispatch(getStats(accessToken))
      ]).then(() => {
        dispatch(makerDataUpdated())
        sessionStorageSet('state:maker_lastUpdated', Date.now())
      }).catch(() => { throw new Error('Unable to get maker data') })
    })
}

export const loginMaker = () => async (dispatch) => {
  dispatch(loadingData(true))
  await dispatch(getAllMakerData())
  dispatch(loadingData(false))
}

export const getMakerProfile = (accessToken) => (dispatch) => {
  return Faast.getMakerProfile(accessToken)
    .then(({ profile }) => {
      if (profile) {
        dispatch(updateBalances(profile.balances))
        sessionStorageSet('state:maker_profile', profile)
        return dispatch(updateProfile(profile))
      }
    })
    .catch((e) => e)
}

export const getMakerSwaps = (accessToken, page, limit) => (dispatch) => {
  dispatch(swapsLoading())
  return Faast.getMakerSwaps(accessToken, page, limit)
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
  const cachedMakerStats = sessionStorageGetJson('state:maker_stats')
  const cachedMakerSwaps = sessionStorageGetJson('state:maker_swaps')
  const cachedMakerProfile = sessionStorageGetJson('state:maker_profile')
  const cachedLastUpdated = sessionStorageGet('state:maker_lastUpdated')
  if (cachedMakerStats && cachedMakerSwaps) {
    dispatch(statsRetrieved(cachedMakerStats))
    dispatch(swapsRetrieved(cachedMakerSwaps))
    dispatch(updateProfile(cachedMakerProfile))
    dispatch(makerDataUpdated(parseInt(cachedLastUpdated)))
    if (isMakerDataStale(getState())) {
      return dispatch(push('/maker/login/loading'))
    }
    return
  }
  else if (isMakerLoggedIn(getState())) {
    return dispatch(makerLogout())
  } 
  return
}

export const makerLogout = () => (dispatch) => {
  clearSession()
  dispatch(push('/makers/login'))
  if (typeof window !== 'undefined') {
    window.reload()
  }
}
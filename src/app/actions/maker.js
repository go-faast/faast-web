import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import Faast from 'Services/Faast'
import { getSession, clearSession } from 'Services/Auth'
import { localStorageSetJson, localStorageGetJson } from 'Utilities/storage'

import { isMakerLoggedIn, isMakerDataStale } from 'Selectors/maker'
import Toastr from 'Utilities/toastrWrapper'

const createAction = newScopedCreateAction(__filename)

export const makerDataUpdated = createAction('MAKER_UPDATED')
export const login = createAction('MAKER_LOGIN')
export const logout = createAction('MAKER_LOGOUT')
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

export const getStats = () => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  return Faast.getMakerStatistics(accessToken)
    .then((stats) => {
      localStorageSetJson('state:maker_stats', stats)
      dispatch(statsRetrieved(stats))
    })
    .catch((e) => { 
      dispatch(statsError(e))
      throw new Error(e)
    })
}

export const getAllMakerData = () => (dispatch) => {
  return Promise.all([
    dispatch(getMakerProfile()),
    dispatch(getMakerSwaps(1)),
    dispatch(getStats())
  ]).then(() => {
    dispatch(makerDataUpdated())
    localStorageSetJson('state:maker_lastUpdated', Date.now())
  }).catch(() => { 
    throw new Error('Error fetch your market maker data. Please try again later.') 
  })
}

export const loginMaker = () => async (dispatch) => {
  try {
    dispatch(loadingData(true))
    await dispatch(getAllMakerData())
    dispatch(login())
    dispatch(loadingData(false))
    return dispatch(push('/makers/dashboard'))
  } catch (err) {
    dispatch(loginError(err))
    dispatch(push('/makers/login'))
    Toastr.error(err.message)
  }
}

export const getMakerProfile = () => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  return Faast.getMakerProfile(accessToken)
    .then((profile) => {
      if (profile) {
        dispatch(updateBalances(profile.balances))
        localStorageSetJson('state:maker_balances', profile.balances)
        localStorageSetJson('state:maker_profile', profile)
        return dispatch(updateProfile(profile))
      }
    })

}

export const getMakerSwaps = (page, limit = 20) => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  dispatch(swapsLoading())
  return Faast.getMakerSwaps(accessToken, page, limit)
    .then((swaps) => {
      dispatch(swapHistoryTotalUpdated(swaps.total))
      localStorageSetJson('state:maker_swap_history_total', swaps.total)
      swaps = swaps && swaps.orders && swaps.orders.map(Faast.formatOrderResult)
      localStorageSetJson('state:maker_swaps', swaps)
      return dispatch(swapsRetrieved(swaps))
    })
    .catch((e) => {
      dispatch(swapsError(e))
      throw new Error(e)
    })
}

export const restoreCachedMakerInfo = () => (dispatch, getState) => {
  const cachedMakerStats = localStorageGetJson('state:maker_stats')
  const cachedMakerSwaps = localStorageGetJson('state:maker_swaps')
  const cachedMakerProfile = localStorageGetJson('state:maker_profile')
  const cachedMakerBalances = localStorageGetJson('state:maker_balances')
  const cachedLastUpdated = localStorageGetJson('state:maker_lastUpdated')
  if (cachedMakerStats && cachedMakerSwaps && cachedMakerBalances && cachedLastUpdated) {
    dispatch(loginMaker())
    dispatch(statsRetrieved(cachedMakerStats))
    dispatch(swapsRetrieved(cachedMakerSwaps))
    dispatch(updateProfile(cachedMakerProfile))
    dispatch(updateBalances(cachedMakerBalances))
    dispatch(makerDataUpdated(parseInt(cachedLastUpdated)))
    if (isMakerDataStale(getState())) {
      return dispatch(push('/makers/login/loading'))
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
  dispatch(resetMaker())
  dispatch(logout())
  dispatch(push('/makers/login'))
}
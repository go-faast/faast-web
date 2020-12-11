import { newScopedCreateAction } from 'Utilities/action'
import { push } from 'react-router-redux'
import Faast from 'Services/Faast'
import { getSession } from 'Services/Auth'
import { sessionStorageSetJson, sessionStorageGetJson, sessionStorageClear } from 'Utilities/storage'

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

const getMakerAccessToken = () => () => {
  const accessToken = getSession().accessToken
  return accessToken
}

export const getStats = () => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  if (accessToken) {
    return Faast.getMakerStatistics(accessToken)
      .then((stats) => {
        sessionStorageSetJson('state:maker_stats', stats)
        dispatch(statsRetrieved(stats))
      })
      .catch((e) => { 
        dispatch(statsError(e))
        throw new Error(e)
      })
  }
  return
}

export const getAllMakerData = () => (dispatch) => {
  dispatch(loadingData(true))
  return Promise.all([
    dispatch(getMakerProfile()),
    dispatch(getMakerSwaps(1)),
    dispatch(getStats())
  ]).then(() => {
    dispatch(makerDataUpdated())
    sessionStorageSetJson('state:maker_lastUpdated', Date.now())
    dispatch(loadingData(false))
  }).catch(() => { 
    dispatch(loadingData(false))
    throw new Error('Error fetching your market maker data. Please try again later.') 
  })
}

export const loginMaker = () => async (dispatch) => {
  try {
    let user = await dispatch(getAuth0User())
    user = user[0]
    if (user && (!user.app_metadata || user.app_metadata && !user.app_metadata.maker_id)) {
      return dispatch(push('/makers/register/profile'))
    }
    await dispatch(getAllMakerData())
    dispatch(login())
    dispatch(push('/makers/dashboard'))
  } catch (err) {
    dispatch(loginError(err))
    dispatch(push('/makers/login'))
    Toastr.error(err.message)
  }
}

export const getAuth0User = () => async (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  const userId = getSession().tokenPayload && getSession().tokenPayload.sub
  const user = await Faast.getAuth0User(accessToken, userId)
  return user
}

export const registerMaker = (profile) => async (dispatch) => {
  try {
    const accessToken = dispatch(getMakerAccessToken())
    const userId = getSession().tokenPayload && getSession().tokenPayload.sub
    profile.auth0UserId = userId
    const makerProfile = await Faast.createMaker(accessToken, profile)
    dispatch(updateProfile(makerProfile))
    dispatch(login())
    dispatch(push('/makers/dashboard'))
  } catch (err) {
    dispatch(loginError(err))
    dispatch(push('/makers/login'))
    Toastr.error('Unable to complete user signup. Please contact support@faa.st.')
  }
}

export const getMakerProfile = () => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  if (accessToken) {
    return Faast.getMakerProfile(accessToken)
      .then((profile) => {
        if (profile) {
          dispatch(updateBalances(profile.balances))
          sessionStorageSetJson('state:maker_balances', profile.balances)
          sessionStorageSetJson('state:maker_profile', profile)
          return dispatch(updateProfile(profile))
        }
      })
  }
  return
}

export const getMakerSwaps = (page, limit = 20) => (dispatch) => {
  const accessToken = dispatch(getMakerAccessToken())
  if (accessToken) {
    dispatch(swapsLoading())
    return Faast.getMakerSwaps(accessToken, page, limit)
      .then((swaps) => {
        dispatch(swapHistoryTotalUpdated(swaps.total))
        sessionStorageSetJson('state:maker_swap_history_total', swaps.total)
        swaps = swaps && swaps.orders && swaps.orders.map(Faast.formatOrderResult)
        sessionStorageSetJson('state:maker_swaps', swaps)
        return dispatch(swapsRetrieved(swaps))
      })
      .catch((e) => {
        dispatch(swapsError(e))
        throw new Error(e)
      })
  }
  return
}

export const restoreCachedMakerInfo = () => (dispatch, getState) => {
  const cachedMakerStats = sessionStorageGetJson('state:maker_stats')
  const cachedMakerSwaps = sessionStorageGetJson('state:maker_swaps')
  const cachedMakerProfile = sessionStorageGetJson('state:maker_profile')
  const cachedMakerBalances = sessionStorageGetJson('state:maker_balances')
  const cachedLastUpdated = sessionStorageGetJson('state:maker_lastUpdated')
  if (cachedMakerStats && cachedMakerSwaps && cachedMakerBalances && cachedLastUpdated) {
    dispatch(statsRetrieved(cachedMakerStats))
    dispatch(swapsRetrieved(cachedMakerSwaps))
    dispatch(updateProfile(cachedMakerProfile))
    dispatch(updateBalances(cachedMakerBalances))
    dispatch(makerDataUpdated(parseInt(cachedLastUpdated)))
    dispatch(login())
    if (isMakerDataStale(getState())) {
      return dispatch(getAllMakerData())
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
  dispatch(logout())
  dispatch(push('/makers/login'))
}
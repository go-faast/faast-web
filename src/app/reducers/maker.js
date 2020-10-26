import { createReducer } from 'redux-act'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateMakerId, updateSecretKey, resetMaker, logout, updateProfile,
  swapsLoading, makerDataUpdated, swapHistoryTotalUpdated, loadingLogin,
} from 'Actions/maker'

const initialState = {
  lastUpdated: undefined,
  loggedIn: false,
  loadingLogin: false,
  profile: undefined,
  swapCount: undefined,
  maker_id: '',
  secret_key: '',
  loginError: false,
  swapsError: '',
  swapsLoading: false,
  statsError: '',
  stats: {},
  swaps: {},
}

export default createReducer({
  [login]: (state) => ({ ...state, loggedIn: true, loginError: false, loadingLogin: false }),
  [loadingLogin]: (state) => ({ ...state, loadingLogin: true }),
  [logout]: (state) => ({ ...state, loggedIn: false, loginError: false }),
  [loginError]: (state) => ({ ...state, loggedIn: false, loginError: true, loadingLogin: false }),
  [updateMakerId]: (state, id) => ({ ...state, affiliate_id: id }),
  [updateProfile]: (state, profile) => ({ ...state, profile }),
  [updateSecretKey]: (state, key) => ({ ...state, secret_key: key }),
  [makerDataUpdated]: (state, timestamp = Date.now()) => ({ ...state, lastUpdated: timestamp }),
  [statsRetrieved]: (state, stats) => ({ 
    ...state,
    statsError: '',
    stats: { ...stats },
  }),
  [swapHistoryTotalUpdated]: (state, total) => ({ 
    ...state,
    swapHistoryTotal: total,
  }),
  [statsError]: (state, error) => ({ ...state, statsError: error }),
  [swapsLoading]: (state) => ({ ...state, swapsLoading: true }),
  [swapsRetrieved]: (state, swaps) => ({ 
    ...state,
    swaps: { ...swaps },
    swapsError: '',
    swapsLoading: false,
  }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error, swapsLoading: false }),
  [resetMaker]: () => initialState
}, initialState)

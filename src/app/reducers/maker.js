import { createReducer } from 'redux-act'
import { 
  statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  resetMaker, logout, updateProfile,
  swapsLoading, makerDataUpdated, loadingData,
  updateBalances
} from 'Actions/maker'

const initialState = {
  lastUpdated: undefined,
  balances: [],
  loggedIn: false,
  loadingData: false,
  profile: {},
  swapCount: undefined,
  loginError: false,
  swapsError: '',
  swapsLoading: false,
  statsError: '',
  stats: {
    revenue: undefined,
    expenses: {}
  },
  swaps: {},
}

export default createReducer({
  [login]: (state) => ({ ...state, loggedIn: true, loginError: false, loadingLogin: false }),
  [loadingData]: (state, loadingData) => ({ ...state, loadingData }),
  [logout]: (state) => ({ ...state, loggedIn: false, loginError: false }),
  [loginError]: (state) => ({ ...state, loggedIn: false, loginError: true, loadingLogin: false }),
  [updateProfile]: (state, profile) => ({ ...state, profile }),
  [updateBalances]: (state, balances) => ({ ...state, balances }),
  [makerDataUpdated]: (state, timestamp = Date.now()) => ({ ...state, lastUpdated: timestamp }),
  [statsRetrieved]: (state, stats) => ({ 
    ...state,
    statsError: '',
    stats: { ...stats },
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

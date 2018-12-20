import { createReducer } from 'redux-act'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateAffiliateId, updateSecretKey, resetAffiliate, logout, updateBalance, updateBalanceSwaps,
  withdrawalsRetrieved, withdrawalsError, swapsLoading
} from 'Actions/affiliate'

const initialState = {
  lastUpdated: undefined,
  loggedIn: false,
  balance: undefined,
  swapCount: undefined,
  affiliate_id: '',
  secret_key: '',
  loginError: false,
  swapsError: '',
  swapsLoading: false,
  statsError: '',
  stats: {},
  swaps: {},
  withdrawals: {},
  withdrawalsError: '',
}

export default createReducer({
  [login]: (state) => ({ ...state, loggedIn: true, loginError: false }),
  [logout]: (state) => ({ ...state, loggedIn: false, loginError: false }),
  [loginError]: (state) => ({ ...state, loggedIn: false, loginError: true }),
  [updateAffiliateId]: (state, id) => ({ ...state, affiliate_id: id }),
  [updateBalance]: (state, balance) => ({ ...state, balance }),
  [updateBalanceSwaps]: (state, swaps) => ({ ...state, swapCount: swaps }),
  [updateSecretKey]: (state, key) => ({ ...state, secret_key: key }),
  [statsRetrieved]: (state, stats) => ({ 
    ...state,
    statsError: '',
    stats: { ...stats },
    lastUpdated: Date.now(),
  }),
  [statsError]: (state, error) => ({ ...state, statsError: error }),
  [swapsLoading]: (state) => ({ ...state, swapsLoading: true }),
  [swapsRetrieved]: (state, swaps) => ({ 
    ...state,
    swapsError: '',
    swapsLoading: false,
    swaps: { ...swaps },
    lastUpdated: Date.now(),
  }),
  [withdrawalsRetrieved]: (state, withdrawals) => ({ 
    ...state,
    lastUpdated: Date.now(),
    withdrawalsError: '',
    withdrawals: { ...withdrawals }
  }),
  [withdrawalsError]: (state, error) => ({ ...state, withdrawalsError: error }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error, swapsLoading: false }),
  [resetAffiliate]: () => initialState
}, initialState)

import { createReducer } from 'redux-act'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateAffiliateId, updateSecretKey, resetAffiliate, logout, updateBalance, updateBalanceSwaps,
  withdrawalsRetrieved, withdrawalsError, swapsLoading, affiliateDataUpdated, updateSwapsChart,
  swapChartLoading, swapHistoryTotalUpdated, updateSwapExportLink, swapExportLinkLoading
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
  swapExportLink: null,
  swapExportLinkLoading: false,
  swapHistoryTotal: null,
  swapChartData: [],
  swapChartLoading: false,
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
  [affiliateDataUpdated]: (state, timestamp = Date.now()) => ({ ...state, lastUpdated: timestamp }),
  [updateSwapsChart]: (state, swapChartData) => ({ ...state, swapChartData, swapChartLoading: false }),
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
  [swapChartLoading]: (state) => ({ ...state, swapChartLoading: true }),
  [swapsRetrieved]: (state, swaps) => ({ 
    ...state,
    swapsError: '',
    swapsLoading: false,
    swaps: { ...swaps },
  }),
  [withdrawalsRetrieved]: (state, withdrawals) => ({ 
    ...state,
    withdrawalsError: '',
    withdrawals: { ...withdrawals }
  }),
  [updateSwapExportLink]: (state, exportLink) => ({ ...state, swapExportLink: exportLink, swapExportLinkLoading: false }),
  [swapExportLinkLoading]: (state) => ({ ...state, swapExportLinkLoading: true }),
  [withdrawalsError]: (state, error) => ({ ...state, withdrawalsError: error }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error, swapsLoading: false }),
  [resetAffiliate]: () => initialState
}, initialState)

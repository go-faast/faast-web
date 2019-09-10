import { createReducer } from 'redux-act'
import { statsRetrieved, statsError, login, swapsRetrieved, swapsError, loginError,
  updateAffiliateId, updateSecretKey, resetAffiliate, logout, updateBalance, updateBalanceSwaps,
  withdrawalsRetrieved, withdrawalsError, swapsLoading, affiliateDataUpdated, updateSwapsChart,
  swapChartLoading, swapHistoryTotalUpdated, updateSwapExportLink, swapExportLinkLoading,
  updateMinimumWithdrawal, withdrawalsTotalUpdated, withdrawalsLoading
} from 'Actions/affiliate'

const initialState = {
  lastUpdated: undefined,
  loggedIn: false,
  balance: undefined,
  minimumWithdrawal: undefined,
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
  totalWithdrawals: null,
  withdrawalsLoading: false,
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
  [updateMinimumWithdrawal]: (state, minimumWithdrawal) => ({ ...state, minimumWithdrawal }),
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
    swaps: { ...swaps },
    swapsError: '',
    swapsLoading: false,
  }),
  [withdrawalsRetrieved]: (state, withdrawals) => ({ 
    ...state,
    withdrawalsError: '',
    withdrawalsLoading: false,
    withdrawals: { ...withdrawals }
  }),
  [withdrawalsTotalUpdated]: (state, total) => ({ 
    ...state,
    totalWithdrawals: total,
  }),
  [withdrawalsLoading]: (state) => ({ ...state, withdrawalsLoading: true }),
  [updateSwapExportLink]: (state, exportLink) => ({ ...state, swapExportLink: exportLink, swapExportLinkLoading: false }),
  [swapExportLinkLoading]: (state) => ({ ...state, swapExportLinkLoading: true }),
  [withdrawalsError]: (state, error) => ({ ...state, withdrawalsError: error }),
  [swapsError]: (state, error) => ({ ...state, swapsError: error, swapsLoading: false }),
  [resetAffiliate]: () => initialState
}, initialState)

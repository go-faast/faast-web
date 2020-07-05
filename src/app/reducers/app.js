import { createReducer } from 'redux-act'

import {
  reducerFunctions as commonReducerFunctions,
  initialState as commonInitialState
} from 'Common/reducers/app'
import { appReady, appError, updateAssetsFilterByTradeable, 
  updateSwapWidgetInputs, updateConnectForwardUrl, updateRememberWallets } from 'Actions/app'

export default createReducer({
  ...commonReducerFunctions,
  [appReady]: (state) => ({ ...state, ready: true }),
  [updateRememberWallets]: (state, rememberWallets) => ({ ...state, rememberWallets }),
  [updateConnectForwardUrl]: (state, connectForwardUrl) => ({ ...state, connectForwardUrl }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
  [updateAssetsFilterByTradeable]: (state, filterTradeableAssets) => ({ ...state, filterTradeableAssets }),
}, {
  ...commonInitialState,
  connectForwardUrl: '/dashboard',
  ready: false,
  showFeedbackForm: false,
  requestedAsset: undefined,
  error: '',
  filterTradeableAssets: undefined,
  savedSwapWidgetInputs: undefined,
  rememberWallets: 'local'
})

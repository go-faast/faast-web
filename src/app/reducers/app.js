import { createReducer } from 'redux-act'

import {
  reducerFunctions as commonReducerFunctions,
  initialState as commonInitialState
} from 'Common/reducers/app'
import { appReady, appError, updateAssetsFilterByTradeable, 
  updateSwapWidgetInputs, updateConnectForwardUrl } from 'Actions/app'

export default createReducer({
  ...commonReducerFunctions,
  [appReady]: (state) => ({ ...state, ready: true }),
  [updateConnectForwardUrl]: (state, connectForwardUrl) => ({ ...state, connectForwardUrl }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
  [updateAssetsFilterByTradeable]: (state, filterTradeableAssets) => ({ ...state, filterTradeableAssets }),
  [updateSwapWidgetInputs]: (state, { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId }) => 
    ({ ...state, savedSwapWidgetInputs: { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId } }),
}, {
  ...commonInitialState,
  connectForwardUrl: '/dashboard',
  ready: false,
  showFeedbackForm: false,
  requestedAsset: undefined,
  error: '',
  filterTradeableAssets: undefined,
  savedSwapWidgetInputs: undefined
})

import { createReducer } from 'redux-act'

import {
  reducerFunctions as commonReducerFunctions,
  initialState as commonInitialState
} from 'Common/reducers/app'
import { appReady, appError, updateAssetsFilterByTradeable } from 'Actions/app'

export default createReducer({
  ...commonReducerFunctions,
  [appReady]: (state) => ({ ...state, ready: true }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
  [updateAssetsFilterByTradeable]: (state, filterTradeableAssets) => ({ ...state, filterTradeableAssets }),
}, {
  ...commonInitialState,
  ready: false,
  error: '',
  filterTradeableAssets: undefined,
})

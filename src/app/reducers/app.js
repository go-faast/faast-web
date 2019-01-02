import { createReducer } from 'redux-act'

import {
  reducerFunctions as commonReducerFunctions,
  initialState as commonInitialState
} from 'Common/reducers/app'
import { appReady, appError } from 'Actions/app'

export default createReducer({
  ...commonReducerFunctions,
  [appReady]: (state) => ({ ...state, ready: true }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
}, {
  ...commonInitialState,
  ready: false,
  error: '',
})

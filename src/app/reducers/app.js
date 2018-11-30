import { createReducer } from 'redux-act'

import { appReady, appError, restrictionsUpdated, restrictionsError } from 'Actions/app'

export default createReducer({
  [appReady]: (state) => ({ ...state, ready: true }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
  [restrictionsUpdated]: (state, { blocked, restricted }) => ({ ...state, blocked: true, restricted }),
  [restrictionsError]: (state, error) => ({ ...state, error })
}, {
  ready: false,
  error: '',
})
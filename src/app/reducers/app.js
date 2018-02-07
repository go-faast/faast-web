import { createReducer } from 'redux-act'

import { appReady, appError } from 'Actions/app'

export default createReducer({
  [appReady]: (state) => ({ ...state, ready: true }),
  [appError]: (state, error) => ({ ...state, error: error.message || error }),
}, {
  ready: false,
  error: '',
})
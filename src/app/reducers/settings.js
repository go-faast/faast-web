import { createReducer } from 'redux-act'

import { resetAll } from 'Actions/app'
import { setSettings } from 'Actions/settings'

const initialState = {}

export default createReducer({
  [resetAll]: () => initialState,
  [setSettings]: (state, payload) => ({ ...state, ...(payload || {}) }),
}, initialState)

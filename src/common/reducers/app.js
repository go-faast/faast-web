import { createReducer } from 'redux-act'

import { restrictionsUpdated, restrictionsError } from 'Common/actions/app'

export const initialState = {
  error: '',
  blocked: false,
  restricted: false,
}

export const reducerFunctions = {
  [restrictionsUpdated]: (state, { blocked, restricted }) => ({ ...state, blocked, restricted }),
  [restrictionsError]: (state, error) => ({ ...state, error })
}

export default createReducer(reducerFunctions, initialState)

import { createReducer } from 'redux-act'

import { restrictionsUpdated, restrictionsError } from 'Common/actions/app'

export const initialState = {
  error: '',
  blocked: false,
  restricted: false,
}

export const reducerFunctions = {
  [restrictionsUpdated]: (state, { res }) => ({ ...state, ...res }),
  [restrictionsError]: (state, error) => ({ ...state, error })
}

export default createReducer(reducerFunctions, initialState)

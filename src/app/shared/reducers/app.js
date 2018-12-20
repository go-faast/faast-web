import { createReducer } from 'redux-act'

import { restrictionsUpdated, restrictionsError } from 'Shared/actions/app'

export default createReducer({
  [restrictionsUpdated]: (state, { blocked, restricted }) => ({ ...state, blocked, restricted }),
  [restrictionsError]: (state, error) => ({ ...state, error })
}, {
  ready: false,
  error: '',
})
import { createReducer } from 'redux-act'
import { setAccountSearchQuery, setAccountSearchError, setAccountSearchResult } from 'Actions/accountSearch'

const initialState = {
  query: '',
  pending: false,
  error: '',
  resultId: ''
}

export default createReducer({
  [setAccountSearchQuery]: (state, query) => ({ ...state, query, pending: true }),
  [setAccountSearchError]: (state, error) => ({ ...state, error, pending: false }),
  [setAccountSearchResult]: (state, resultId) => ({ ...state, resultId, pending: false }),
}, initialState)

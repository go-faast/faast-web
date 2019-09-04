import { createReducer } from 'redux-act'

import { restrictionsUpdated, restrictionsError, updateLanguage, toggleFeedbackForm } from 'Common/actions/app'

export const initialState = {
  language: 'en',
  error: '',
  blocked: false,
  restricted: false,
}

export const reducerFunctions = {
  [restrictionsUpdated]: (state, { res }) => ({ ...state, ...res }),
  [restrictionsError]: (state, error) => ({ ...state, error }),
  [updateLanguage]: (state, { language }) => ({ ...state, language }),
  [toggleFeedbackForm]: (state, { showFeedbackForm, requestedAsset }) => ({ ...state, showFeedbackForm, requestedAsset }),
}

export default createReducer(reducerFunctions, initialState)

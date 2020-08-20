import { createReducer } from 'redux-act'

import { restrictionsUpdated, restrictionsError, updateLanguage, toggleFeedbackForm, updateSwapWidgetInputs } from 'Common/actions/app'

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
  [updateSwapWidgetInputs]: (state, { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId }) => 
    ({ ...state, savedSwapWidgetInputs: { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId } }),
}

export default createReducer(reducerFunctions, initialState)

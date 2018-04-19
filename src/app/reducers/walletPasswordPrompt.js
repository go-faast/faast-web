import { createReducer } from 'redux-act'
import { identity } from 'lodash'

import { passwordPromptOpen, passwordPromptClose } from 'Actions/walletPasswordPrompt'

const initialState = {
  isOpen: false,
  walletId: '',
  resolve: identity,
  reject: identity,
}

export default createReducer({
  [passwordPromptOpen]: (state, { walletId, resolve, reject }) => ({ ...state, isOpen: true, walletId, resolve, reject }),
  [passwordPromptClose]: () => initialState,
}, initialState)

import { createReducer } from 'redux-act'

import { resetAll } from 'Actions/app'
import { toggleOrderModal, showOrderModal, hideOrderModal } from 'Actions/orderModal'

const initialState = {
  show: false
}

export default createReducer({
  [resetAll]: () => initialState,
  [toggleOrderModal]: (state) => ({ ...state, show: !state.show }),
  [showOrderModal]: (state) => ({ ...state, show: true }),
  [hideOrderModal]: (state) => ({ ...state, show: false }),
}, initialState)

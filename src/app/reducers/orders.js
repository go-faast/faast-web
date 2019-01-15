import { createReducer } from 'redux-act'

import {
  allOrdersLoaded,
  ordersLoading,
  ordersLoaded,
} from 'Actions/swap'

const initialState = {
  allOrdersLoaded: false,
  ordersLoading: false,
}

export default createReducer({
  [allOrdersLoaded]: (state) => ({ ...state, allOrdersLoaded: true }),
  [ordersLoading]: (state) => ({ ...state, ordersLoading: true }),
  [ordersLoaded]: (state) => ({ ...state, ordersLoading: false })
}, initialState)

import { createReducer } from 'redux-act'
import merge from 'lodash.merge'

import { walletAdded, walletRemoved, allWalletsRemoved, walletBalancesUpdated } from './actions'

const initialState = {}

export default createReducer({
  [walletAdded]: (state, wallet) => merge({}, state, { [wallet.id]: wallet }),
  [walletRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [allWalletsRemoved]: () => initialState,
  [walletBalancesUpdated]: (state, { id, balances }) => merge({}, state, { [id]: { balances } })
}, initialState)
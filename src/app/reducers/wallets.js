import { createReducer } from 'redux-act'
import merge from 'lodash.merge'
import { resetAll } from 'Actions/redux'
import { walletAdded, walletRemoved, allWalletsRemoved, walletBalancesUpdated } from 'Actions/wallet'

const initialState = {}

export default createReducer({
  [resetAll]: () => initialState,
  [allWalletsRemoved]: () => initialState,
  [walletRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [walletAdded]: (state, wallet) => merge({}, state, { [wallet.id]: wallet }),
  [walletBalancesUpdated]: (state, { id, balances }) => merge({}, state, { [id]: { balances } })
}, initialState)
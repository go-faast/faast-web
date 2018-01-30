import { createReducer } from 'redux-act'
import merge from 'lodash.merge'
import union from 'lodash.union'

import { portfolioAdded, portfolioRemoved, allPortfoliosRemoved, portfolioWalletAdded } from 'Actions/wallet'

const initialState = {}
const initialPortfolioState = {
  wallets: []
}

export default createReducer({
  [portfolioAdded]: (state, portfolio) => merge({}, state, {
    [portfolio.id]: {
      ...initialPortfolioState,
      ...portfolio
    }
  }),
  [portfolioRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [allPortfoliosRemoved]: () => initialState,
  [portfolioWalletAdded]: (state, { portfolioId, walletId }) => merge({}, state, {
    [portfolioId]: {
      wallets: union(state[portfolioId].wallets, [walletId])
    }
  })
}, initialState)
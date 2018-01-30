import { createReducer } from 'redux-act'
import merge from 'lodash.merge'
import union from 'lodash.union'
import { resetAll } from 'Actions/redux'
import { portfolioAdded, portfolioRemoved, allPortfoliosRemoved, portfolioWalletAdded } from 'Actions/wallet'

const initialState = {}
const initialPortfolioState = {
  wallets: []
}

export default createReducer({
  [resetAll]: () => initialState,
  [allPortfoliosRemoved]: () => initialState,
  [portfolioRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [portfolioAdded]: (state, portfolio) => merge({}, state, {
    [portfolio.id]: {
      ...initialPortfolioState,
      ...portfolio
    }
  }),
  [portfolioWalletAdded]: (state, { portfolioId, walletId }) => merge({}, state, {
    [portfolioId]: {
      wallets: union(state[portfolioId].wallets, [walletId])
    }
  })
}, initialState)
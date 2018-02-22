import { createReducer } from 'redux-act'
import { resetAll } from 'Actions/redux'
import { walletRemoved } from 'Actions/wallet'
import { setCurrentPortfolio, setCurrentWallet, portfolioAdded } from 'Actions/portfolio'
import { merge } from 'Utilities/helpers'

const defaultPortfolioId = 'default'

const initialState = {
  currentId: defaultPortfolioId,
  currentWalletId: null,
  portfolioIds: [],
}

export default createReducer({
  [resetAll]: () => initialState,
  [setCurrentPortfolio]: (state, { portfolioId }) => ({ ...state, currentId: portfolioId, currentWalletId: portfolioId }),
  [setCurrentWallet]: (state, { portfolioId, walletId }) => ({ ...state, currentId: portfolioId, currentWalletId: walletId }),
  [portfolioAdded]: (state, walletId) => merge(state, {
    portfolioIds: { $union: [walletId] }
  }),
  [walletRemoved]: (state, { id }) => merge(state, {
    portfolioIds: { $without: [id] },
    currentId: state.currentId === id ? defaultPortfolioId : state.currentId,
    currentWalletId: state.currentWalletId === id ? null : state.currentWalletId,
  }),
}, initialState)

import { createReducer } from 'redux-act'
import { resetAll } from 'Actions/app'
import { walletRemoved } from 'Actions/wallet'
import { setCurrentPortfolio, setCurrentWallet, setCurrentPortfolioAndWallet, portfolioAdded } from 'Actions/portfolio'
import { merge } from 'Utilities/helpers'

const defaultPortfolioId = 'default'

const initialState = {
  currentId: defaultPortfolioId,
  currentWalletId: defaultPortfolioId,
  portfolioIds: [],
}

export default createReducer({
  [resetAll]: () => initialState,
  [setCurrentPortfolio]: (state, { portfolioId }) => ({ ...state, currentId: portfolioId, currentWalletId: portfolioId }),
  [setCurrentWallet]: (state, { walletId }) => ({ ...state, currentWalletId: walletId }),
  [setCurrentPortfolioAndWallet]: (state, { portfolioId, walletId }) => ({ ...state, currentId: portfolioId, currentWalletId: walletId }),
  [portfolioAdded]: (state, walletId) => merge(state, {
    portfolioIds: { $union: [walletId] }
  }),
  [walletRemoved]: (state, { id }) => merge(state, {
    portfolioIds: { $without: [id] },
    currentWalletId: state.currentWalletId === id ? state.currentId : state.currentWalletId,
    ...(state.currentId === id ? {
      currentId: defaultPortfolioId,
      currentWalletId: defaultPortfolioId,
    } : {}),
  }),
}, initialState)

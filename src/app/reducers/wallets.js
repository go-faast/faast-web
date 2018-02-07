import { createReducer } from 'redux-act'
import { merge, mapValues } from 'Utilities/helpers'
import { resetAll } from 'Actions/redux'
import {
  walletUpdated, walletRemoved, allWalletsRemoved,
  walletBalancesUpdating, walletBalancesUpdated, walletBalancesError
} from 'Actions/wallet'
import {
  portfolioAdded, portfolioWalletAdded,
  portfolioRemoved, allPortfoliosRemoved
} from 'Actions/portfolio'

const initialState = {}
const walletInitialState = {
  portfolioIds: [],
  supportedAssets: [],
  balances: {},
  balancesUpdating: false,
  balancesLoaded: false,
  balancesError: '',
}

export default createReducer({
  [resetAll]: () => initialState,
  [allWalletsRemoved]: () => initialState,
  [walletRemoved]: (state, { id }) => ({ ...state, [id]: undefined }),
  [walletUpdated]: (state, wallet) => merge(state, { [wallet.id]: { ...walletInitialState, ...wallet } }),
  [walletBalancesUpdating]: (state, { id }) => merge(state, { [id]: { balancesUpdating: true } }),
  [walletBalancesUpdated]: (state, { id, balances }) => merge(state, { [id]: { balances, balancesUpdating: false, balancesLoaded: true } }),
  [walletBalancesError]: (state, { id, error }) => merge(state, { [id]: { balancesError: error } }),

  [portfolioAdded]: (state, { id: portfolioId, wallets = [] }) => 
    merge(state, ...wallets.map((walletId) => ({ [walletId]: { portfolioIds: { $union: [portfolioId] } } }))),
  [portfolioWalletAdded]: (state, { portfolioId, walletId }) =>
    merge(state, { [walletId]: { portfolioIds: { $union: [portfolioId] } } }),
  [portfolioRemoved]: (state, { id: portfolioId }) =>
    merge(state, Object.keys(state).map((walletId) => ({ [walletId]: { portfolioIds: { $without: [portfolioId] } } }))),
  [allPortfoliosRemoved]: (state) => mapValues(state, (wallet) => ({
    ...wallet,
    portfolioIds: []
  }))
}, initialState)
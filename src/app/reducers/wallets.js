import { createReducer } from 'redux-act'
import { resetAll } from 'Actions/redux'
import {
  walletAdded, walletUpdated, walletRemoved, allWalletsRemoved, 
  walletBalancesUpdating, walletBalancesUpdated, walletBalancesError
} from 'Actions/wallet'

const initialState = {}
const walletInitialState = {
  id: '',
  type: '',
  address: '',
  isBlockstack: false,
  isReadOnly: false,
  supportedAssets: [],
  nestedWalletIds: [],
  balances: {},
  balancesUpdating: false,
  balancesLoaded: false,
  balancesError: '',
}

const updateWallet = (state, wallet) => ({
  ...state,
  [wallet.id]: {
    ...(state[wallet.id] || walletInitialState),
    ...wallet,
  }
})

export default createReducer({
  [resetAll]: () => initialState,
  [allWalletsRemoved]: () => initialState,
  [walletAdded]: updateWallet,
  [walletUpdated]: (state, wallet) => updateWallet(state, {
    ...wallet,
    balancesLoaded: false,
  }),
  [walletRemoved]: (state, { id }) => ({
    ...state,
    [id]: undefined
  }),
  [walletBalancesUpdating]: (state, { id }) => updateWallet(state, {
    id,
    balancesUpdating: true,
  }),
  [walletBalancesUpdated]: (state, { id, balances }) => updateWallet(state, {
    id,
    balances,
    balancesUpdating: false,
    balancesLoaded: true
  }),
  [walletBalancesError]: (state, { id, error }) => updateWallet(state, {
    id,
    balancesError: error,
  }),
}, initialState)
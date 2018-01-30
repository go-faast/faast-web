import { createAction } from 'redux-act'

export const resetAll = createAction('RESET_ALL')

export const setCurrentWallet = createAction('SET_CURRENT_WALLET', (walletOrId) => ({
  id: walletOrId && ((walletOrId.getId && walletOrId.getId()) || walletOrId)
}))

export const setAssets = createAction('SET_ASSETS')

export const resetPortfolio = createAction('RESET_PORTFOLIO')

export const loadingPortfolio = createAction('LOADING_PORTFOLIO')

export const setPortfolio = createAction('SET_PORTFOLIO')

export const setPortfolioItem = createAction('SET_PORTFOLIO_ITEM', (symbol, item) => ({ symbol, item }))

export const setSwap = createAction('SET_SWAP')

export const addSwapDeposit = createAction('ADD_SWAP_DEPOSIT')

export const removeSwapDeposit = createAction('REMOVE_SWAP_DEPOSIT')

export const addSwapReceive = createAction('ADD_SWAP_RECEIVE', (depositSymbol, receiveSymbol) => ({ depositSymbol, receiveSymbol }))

export const removeSwapReceive = createAction('REMOVE_SWAP_RECEIVE', (depositSymbol, receiveSymbol) => ({ depositSymbol, receiveSymbol }))

export const resetSwap = createAction('RESET_SWAP')

export const setMock = createAction('SET_MOCK')

export const setSwapData = createAction('SET_SWAP_DATA')

export const insertSwapData = createAction('INSERT_SWAP_DATA', (depositSymbol, receiveSymbol, data) => ({ depositSymbol, receiveSymbol, data }))

export const updateSwapTx = createAction('UPDATE_SWAP_TX', (depositSymbol, receiveSymbol, data) => ({ depositSymbol, receiveSymbol, data }))

export const updateSwapOrder = createAction('UPDATE_SWAP_ORDER', (depositSymbol, receiveSymbol, data) => ({ depositSymbol, receiveSymbol, data }))

export const toggleOrderModal = createAction('TOGGLE_ORDER_MODAL')

export const showOrderModal = createAction('SHOW_ORDER_MODAL')

export const hideOrderModal = createAction('HIDE_ORDER_MODAL')

export const setSettings = createAction('SET_SETTINGS')

export const setBreakpoints = createAction('SET_BREAKPOINTS')


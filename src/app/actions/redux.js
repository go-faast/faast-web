export const resetAll = () => ({
  type: 'RESET_ALL'
})

export const setWallet = (type, address, data) => ({
  type: 'SET_WALLET',
  payload: { type, address, data }
})

export const setAssets = (assets) => ({
  type: 'SET_ASSETS',
  payload: assets
})

export const resetPortfolio = () => ({
  type: 'RESET_PORTFOLIO'
})

export const loadingPortfolio = (bool) => ({
  type: 'LOADING_PORTFOLIO',
  payload: bool
})

export const setPortfolio = (data) => ({
  type: 'SET_PORTFOLIO',
  payload: data
})

export const setPortfolioItem = (symbol, item) => ({
  type: 'SET_PORTFOLIO_ITEM',
  payload: { symbol, item }
})

export const setSwap = (list) => ({
  type: 'SET_SWAP',
  payload: list
})

export const addSwapDeposit = (symbol) => ({
  type: 'ADD_SWAP_DEPOSIT',
  payload: symbol
})

export const removeSwapDeposit = (symbol) => ({
  type: 'REMOVE_SWAP_DEPOSIT',
  payload: symbol
})

export const addSwapReceive = (depositSymbol, receiveSymbol) => ({
  type: 'ADD_SWAP_RECEIVE',
  payload: { depositSymbol, receiveSymbol }
})

export const removeSwapReceive = (depositSymbol, receiveSymbol) => ({
  type: 'REMOVE_SWAP_RECEIVE',
  payload: { depositSymbol, receiveSymbol }
})

export const resetSwap = () => ({
  type: 'RESET_SWAP'
})

export const setMock = (mock) => ({
  type: 'SET_MOCK',
  payload: mock
})

export const insertSwapData = (depositSymbol, receiveSymbol, data) => ({
  type: 'INSERT_SWAP_DATA',
  payload: { depositSymbol, receiveSymbol, data }
})

export const updateSwapTx = (depositSymbol, receiveSymbol, data) => ({
  type: 'UPDATE_SWAP_TX',
  payload: { depositSymbol, receiveSymbol, data }
})

export const updateSwapOrder = (depositSymbol, receiveSymbol, data) => ({
  type: 'UPDATE_SWAP_ORDER',
  payload: { depositSymbol, receiveSymbol, data }
})

export const toggleOrderModal = () => ({
  type: 'TOGGLE_ORDER_MODAL'
})

export const showOrderModal = () => ({
  type: 'SHOW_ORDER_MODAL'
})

export const hideOrderModal = () => ({
  type: 'HIDE_ORDER_MODAL'
})

export const setSettings = (settings) => ({
  type: 'SET_SETTINGS',
  payload: settings
})

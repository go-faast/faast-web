import { createAction } from 'redux-act'

export const resetAll = createAction('RESET_ALL')

export const setAssets = createAction('SET_ASSETS')

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


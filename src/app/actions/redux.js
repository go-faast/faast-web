import { newScopedCreateAction } from 'Utilities/action'

const createAction = newScopedCreateAction(__filename)

export const resetAll = createAction('RESET_ALL')

export const setMock = createAction('SET_MOCK')

export const toggleOrderModal = createAction('TOGGLE_ORDER_MODAL')

export const showOrderModal = createAction('SHOW_ORDER_MODAL')

export const hideOrderModal = createAction('HIDE_ORDER_MODAL')

export const setSettings = createAction('SET_SETTINGS')


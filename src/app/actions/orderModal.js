import { newScopedCreateAction } from 'Utilities/action'

const createAction = newScopedCreateAction(__filename)

export const toggleOrderModal = createAction('TOGGLE')

export const showOrderModal = createAction('SHOW')

export const hideOrderModal = createAction('HIDE')

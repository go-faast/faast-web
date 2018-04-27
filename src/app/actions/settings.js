import { newScopedCreateAction } from 'Utilities/action'

const createAction = newScopedCreateAction(__filename)

export const setSettings = createAction('SET')


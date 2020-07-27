import { newScopedCreateAction } from 'Utilities/action'

const createAction = newScopedCreateAction(__filename)

export const updateSwapWidgetInputs = createAction('UPDATE_SWAP_WIDGET_INPUTS', (inputs) => (inputs))
export const updateCreatedSwap = createAction('UPDATE_WIDGET_SWAP', (swap) => (swap))
export const restoreSwapWidget = createAction('RESTORE_SWAP_WIDGET', (swap) => (swap))

export const saveSwapWidgetInputs = (inputs) => (dispatch) => Promise.resolve()
  .then(() => {
    dispatch(updateSwapWidgetInputs(inputs))
  }) 

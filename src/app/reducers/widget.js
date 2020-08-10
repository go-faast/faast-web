import { createReducer } from 'redux-act'
import { updateSwapWidgetInputs, updateCreatedSwap, restoreSwapWidget } from 'Actions/widget'

export default createReducer({
  [updateSwapWidgetInputs]: (state, newSwapInputs) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, ...newSwapInputs } }),
  [updateCreatedSwap]: (state, swap) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, swap } }),
  [restoreSwapWidget]: (state, restoredState) => ({
    ...state,
    ...restoredState
  })
}, {
  swapInputs: undefined,
})

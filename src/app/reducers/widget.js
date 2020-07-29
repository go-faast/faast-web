import { createReducer } from 'redux-act'
import { updateSwapWidgetInputs, updateCreatedSwap, restoreSwapWidget } from 'Actions/widget'

export default createReducer({
  [updateSwapWidgetInputs]: (state, { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId, currentStep }) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId, currentStep } }),
  [updateCreatedSwap]: (state, swap) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, swap } }),
  [restoreSwapWidget]: (state, restoredState) => ({
    ...state,
    ...restoredState
  })
}, {
  swapInputs: undefined,
})

import { createReducer } from 'redux-act'
import { updateSwapWidgetInputs, updateCreatedSwap } from 'Actions/widget'

export default createReducer({
  [updateSwapWidgetInputs]: (state, { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId }) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId } }),
  [updateCreatedSwap]: (state, swap) => 
    ({ ...state, swapInputs: {  ...state.swapInputs, swap } })
}, {
  swapInputs: undefined
})

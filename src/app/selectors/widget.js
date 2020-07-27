import { createSelector } from 'reselect'

export const getWidgetState = ({ widget }) => widget

export const getSavedSwapWidgetInputs = createSelector(getWidgetState, ({ swapInputs }) => swapInputs)
export const getCurrentStep = createSelector(getSavedSwapWidgetInputs, (swapInputs) => swapInputs ? swapInputs.currentStep : 1)
export const getCreatedSwap = createSelector(getWidgetState, ({ swap }) => swap)

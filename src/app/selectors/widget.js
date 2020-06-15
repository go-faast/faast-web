import { createSelector } from 'reselect'

const getWidgetState = ({ widget }) => widget

export const getSavedSwapWidgetInputs = createSelector(getWidgetState, ({ swapInputs }) => swapInputs)
export const getCreatedSwap = createSelector(getWidgetState, ({ swap }) => swap)

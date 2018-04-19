import { createSelector } from 'reselect'

const getPromptState = ({ walletPasswordPrompt }) => walletPasswordPrompt

export const isPasswordPromptOpen = createSelector(getPromptState, ({ isOpen }) => isOpen)
export const getPasswordPromptWalletId = createSelector(getPromptState, ({ walletId }) => walletId)
export const getPasswordPromptResolve = createSelector(getPromptState, ({ resolve }) => resolve)
export const getPasswordPromptReject = createSelector(getPromptState, ({ reject }) => reject)

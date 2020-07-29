import { createSelector } from 'reselect'

import { currySelector } from 'Utilities/selector'
import { getWallet } from './wallet'

const getPromptState = ({ walletPasswordPrompt }) => walletPasswordPrompt

export const isPasswordPromptOpen = createSelector(getPromptState, ({ isOpen }) => isOpen)
export const getPasswordPromptWalletId = createSelector(getPromptState, ({ walletId }) => walletId)
export const getPasswordPromptResolve = createSelector(getPromptState, ({ resolve }) => resolve)
export const getPasswordPromptReject = createSelector(getPromptState, ({ reject }) => reject)
export const getPasswordPromptWallet = currySelector(getWallet, getPasswordPromptWalletId)
export const getPasswordPromptUsername = createSelector(getPasswordPromptWallet, (wallet) => wallet ? wallet.address || wallet.id : '')

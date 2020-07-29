import { newScopedCreateAction } from 'Utilities/action'
import toastr from 'Utilities/toastrWrapper'
import walletService from 'Services/Wallet'

import {
  isPasswordPromptOpen, getPasswordPromptWalletId,
  getPasswordPromptResolve, getPasswordPromptReject
} from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const passwordPromptOpen = createAction('OPEN', (walletId, resolve, reject) => ({ walletId, resolve, reject }))
export const passwordPromptClose = createAction('CLOSE')

export const getWalletPassword = (walletId) => (dispatch, getState) => new Promise((resolve, reject) => {
  const isOpen = isPasswordPromptOpen(getState())
  if (isOpen) {
    return reject(new Error('Password prompt is already open'))
  }
  dispatch(passwordPromptOpen(walletId, resolve, reject))
})

const getPasswordValidationMessage = (values, getState) => {
  const walletId = getPasswordPromptWalletId(getState())
  const walletInstance = walletService.get(walletId)
  const { password } = values
  if (!walletInstance.checkPasswordCorrect(password)) {
    return 'The password you entered is incorrect. Please try again.'
  }
}

export const passwordPromptSubmitValidator = () => (dispatch, getState) => (values) => {
  const errorMessage = getPasswordValidationMessage(values, getState)
  if (errorMessage) {
    return { password: errorMessage }
  }
  return {}
}

export const handlePasswordPromptSubmit = (values) => (dispatch, getState) => {
  console.log('passwordPromptSubmit', values)
  const validationMessage = getPasswordValidationMessage(values, getState)
  if (validationMessage) {
    return toastr.error(validationMessage)
  }
  const resolve = getPasswordPromptResolve(getState())
  resolve(values.password)
  dispatch(passwordPromptClose())
}

export const handlePasswordPromptCancel = () => (dispatch, getState) => {
  const reject = getPasswordPromptReject(getState())
  reject(new Error('User cancelled'))
  dispatch(passwordPromptClose())
}

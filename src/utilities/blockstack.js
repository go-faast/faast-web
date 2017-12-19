import {
  isUserSignedIn,
  signUserOut,
  isSignInPending,
  handlePendingSignIn,
  redirectToSignIn,
  getFile,
  putFile,
  loadUserData
} from 'blockstack'
import log from 'Utilities/log'

const saveSettings = (settings = {}) => {
  putFile('settings.json', JSON.stringify(settings), true)
  .then(() => {
    log.info('Settings updated on blockstack:', settings)
  })
  .catch(log.error)
}

const getSettings = () => {
  return getFile('settings.json', true)
  .then((settingsString) => {
    const settings = JSON.parse(settingsString || '{}')
    log.info('Settings loaded from blockstack:', settings)
    return Promise.resolve(settings)
  })
}

export default {
  signUserOut,
  isUserSignedIn,
  saveSettings,
  getSettings,
  isSignInPending,
  handlePendingSignIn,
  redirectToSignIn,
  loadUserData
}

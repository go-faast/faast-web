import {
  isUserSignedIn,
  loadUserData,
  signUserOut,
  isSignInPending,
  handlePendingSignIn,
  redirectToSignIn,
  getFile,
  putFile
} from 'blockstack'
import log from 'Utilities/log'
import { generateWalletFromPrivateKey } from 'Utilities/wallet'
import { toChecksumAddress } from 'Utilities/convert'

const restoreWallet = () => {
  const userData = loadUserData()
  const encryptedWallet = generateWalletFromPrivateKey(userData.appPrivateKey)
  if (encryptedWallet) {
    return {
      type: 'blockstack',
      address: toChecksumAddress(encryptedWallet.address),
      data: encryptedWallet
    }
  }

  return undefined
}

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
  restoreWallet,
  isUserSignedIn,
  saveSettings,
  getSettings,
  isSignInPending,
  handlePendingSignIn,
  redirectToSignIn
}

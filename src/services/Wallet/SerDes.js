
import blockstack from 'blockstack'
import { sessionStorageSet, sessionStorageGet } from 'Utilities/storage'
import { EthereumWalletKeystore } from 'Services/Wallet/Ethereum'

const restoreFromStorage = () => {
  let data
  try {
    let serialized = sessionStorageGet('wallet')
    data = JSON.parse(serialized)
  } catch (err) {
    return null
  }
  if (!data) {
    return null
  }
  return data
}
  restore = () => {
    if (blockstack.isUserSignedIn()) {
      this.wallets.push(new EthereumWalletKeystore(blockstack.loadUserData().appPrivateKey))
    }
    let data = restoreFromStorage()
    if (data) {
      
    }
  };

  save = () => {

  };
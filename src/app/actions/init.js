
import walletService from 'Services/Wallet'
import { restoreFromAddress } from 'Utilities/storage'
import { statusAllSwaps } from 'Utilities/swap'

import { setSwapData, setSettings } from './redux'
import { getCurrentWallet } from './portfolio'

export const restoreState = () => (dispatch) => {
  walletService.restoreAll()
  const wallet = dispatch(getCurrentWallet())
  const addressState = restoreFromAddress(wallet && wallet.getAddress && wallet.getAddress()) || {}
  const status = statusAllSwaps(addressState.swap)
  const swap = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : addressState.swap
  dispatch(setSwapData(swap))
  const settings = addressState.settings
  dispatch(setSettings(settings))
}
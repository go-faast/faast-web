
import { restoreFromAddress } from 'Utilities/storage'
import { restoreWallet } from 'Utilities/wallet'
import { statusAllSwaps } from 'Utilities/swap'

import { setWallet, setSwapData, setSettings } from './redux'

export const restoreState = () => (dispatch) => {
  const wallet = restoreWallet()
  dispatch(setWallet(wallet))
  const addressState = restoreFromAddress(wallet && wallet.getId()) || {}
  const status = statusAllSwaps(addressState.swap)
  const swap = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : addressState.swap
  dispatch(setSwapData(swap))
  const settings = addressState.settings
  dispatch(setSettings(settings))
}
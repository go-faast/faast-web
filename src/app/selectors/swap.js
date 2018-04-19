import { createSelector } from 'reselect'
import { mapValues } from 'Utilities/helpers'
import { getSwapStatus, getSwapFriendlyError, estimateReceiveAmount, statusAllSwaps } from 'Utilities/swap'
import { createItemSelector, selectItemId } from 'Utilities/selector'

import { getAllAssets } from './asset'

const getSwapState = ({ swap }) => swap

const createSwapExtender = (allAssets) => (swap) => {
  const { sendSymbol, receiveSymbol } = swap
  const sendAsset = allAssets[sendSymbol]
  const receiveAsset = allAssets[receiveSymbol]
  return {
    ...swap,
    sendAsset,
    receiveAsset,
    receiveUnits: estimateReceiveAmount(swap, receiveAsset),
    status: getSwapStatus(swap),
    friendlyError: getSwapFriendlyError(swap),
  }
}

export const getAllSwaps = createSelector(
  getSwapState,
  getAllAssets,
  (allSwaps, allAssets) => mapValues(allSwaps, createSwapExtender(allAssets)))
export const getAllSwapsArray = createSelector(getAllSwaps, Object.values)
export const getSwap = createItemSelector(getAllSwaps, selectItemId, (allSwaps, id) => allSwaps[id])

export const getCurrentSwundle = getAllSwapsArray
export const getCurrentSwundleStatus = createSelector(getCurrentSwundle, statusAllSwaps)

export const isCurrentSwundleReadyToSign = createSelector(getCurrentSwundle, (swaps) => {
  const hasError = swaps.some((swap) => swap.errors && swap.errors.length)
  const statusDetails = swaps.map(({ status: { details } }) => details)
  return !hasError && statusDetails.every(s => s === 'waiting for transaction to be signed')
})

/** Returns an Array of all walletIds used by swaps in the current swundle */
export const getCurrentSwundleWalletIds = createSelector(getCurrentSwundle, (swaps) => 
  Array.from(swaps.reduce(
    (walletIds, { sendWalletId, receiveWalletId }) => 
      walletIds.add(sendWalletId).add(receiveWalletId),
    new Set())))

/** Returns the walletId used by all swaps in the current swundle, or null, if the swaps involve
  * more than one wallet.
  */
export const getCurrentSwundleWalletId = createSelector(
  getCurrentSwundleWalletIds,
  (walletIds) => walletIds.length === 1 ? walletIds[0] : null)

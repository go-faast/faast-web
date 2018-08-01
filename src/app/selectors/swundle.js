import { createSelector } from 'reselect'

import { createItemSelector, selectItemId } from 'Utilities/selector'
import { mapValues } from 'Utilities/helpers'
import { statusAllSwaps } from 'Utilities/swap'

import { getAllSwaps } from './swap'

export const getSwundleState = ({ swundle }) => swundle

const createSwundleExtender = (allSwaps) => (swundle) => {
  const swaps = swundle.swaps.map((swapId) => allSwaps[swapId]).filter(Boolean)
  return {
    ...swundle,
    swaps,
    status: statusAllSwaps(swaps),
  }
}

export const getAllSwundles = createSelector(
  getSwundleState,
  getAllSwaps,
  (allSwundles, allSwaps) => mapValues(allSwundles, createSwundleExtender(allSwaps)))
export const getAllSwundlesArray = createSelector(
  getAllSwundles,
  (allSwundles) => Object.values(allSwundles).sort((a, b) => b.createdDate - a.createdDate) // Most recently created first
)
export const getSwundle = createItemSelector(getAllSwundles, selectItemId, (allSwundles, id) => allSwundles[id])

export const getCurrentSwundle = createSelector(
  getAllSwundlesArray,
  (swundleList) => swundleList.filter(({ sent }) => !sent)[0] // Most recent unsent
)
export const getCurrentSwundleId = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.id : '')
export const isCurrentSwundleSigning = createSelector(getCurrentSwundle, (swundle) => swundle && swundle.signing)
export const isCurrentSwundleSending = createSelector(getCurrentSwundle, (swundle) => swundle && swundle.sending)
export const getCurrentSwundleCreatedDate = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.createdDate : 0)
export const getCurrentSwundleSwaps = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.swaps : [])
export const getCurrentSwundleStatus = createSelector(getCurrentSwundle, (swundle) => swundle && swundle.status)

export const getLatestSwundle = createSelector(
  getAllSwundlesArray,
  (swundleList) => swundleList[0]
)
export const getLatestSwundleId = createSelector(getLatestSwundle, (swundle) => swundle ? swundle.id : '')
export const isLatestSwundleDismissed = createSelector(getLatestSwundle, (swundle) => swundle && swundle.dismissed)
export const isLatestSwundleSummaryShowing = createSelector(
  getLatestSwundle,
  isLatestSwundleDismissed,
  (latestSwundle, isDismissed) => Boolean(latestSwundle) && !isDismissed && latestSwundle.swaps.some((swap) => swap.tx.sent)
)

export const doesCurrentSwundleRequireSigning = createSelector(getCurrentSwundleSwaps,
  (swaps) => swaps.some(({ tx }) => tx && tx.signingSupported && !tx.signed))

export const isCurrentSwundleReadyToSign = createSelector(getCurrentSwundleSwaps,
  (swaps) => swaps.every(({ status }) => ['sign_tx_error', 'signing_unsupported', 'unsigned'].includes(status.detailsCode)))

export const isCurrentSwundleReadyToSend = createSelector(getCurrentSwundleSwaps,
  (swaps) => swaps.every(({ status }) => ['send_tx_error', 'signing_unsupported', 'signed'].includes(status.detailsCode)))

/** Returns an Array of all walletIds used by swaps in the current swundle */
export const getCurrentSwundleWalletIds = createSelector(getCurrentSwundleSwaps, (swaps) => 
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

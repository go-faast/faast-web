import { createSelector } from 'reselect'
import { uniq, map } from 'lodash'

import { createItemSelector, selectItemId } from 'Utilities/selector'
import { mapValues, dateSort } from 'Utilities/helpers'
import { statusAllSwaps } from 'Utilities/swap'
import { ZERO } from 'Utilities/convert'
import { getSwapRequiresSigning, getSwapReadyToSign, getSwapReadyToSend } from 'Utilities/swap'

import { getAllSwaps } from './swap'

export const getSwundleState = ({ swundle }) => swundle

const createSwundleExtender = (allSwaps) => (swundle) => {
  const swaps = swundle.swaps.map((swapId) => allSwaps[swapId]).filter(Boolean)
  return {
    ...swundle,
    swaps,
    status: statusAllSwaps(swaps),
    totalTxFee: uniq(map(swaps.filter((swap) => !swap.error), 'tx'), 'id')
      .reduce((total, tx) => total && tx && tx.feeFiat ? total.plus(tx.feeFiat) : null, ZERO)
  }
}

export const getAllSwundles = createSelector(
  getSwundleState,
  getAllSwaps,
  (allSwundles, allSwaps) => mapValues(allSwundles, createSwundleExtender(allSwaps)))
export const getAllSwundlesArray = createSelector(
  getAllSwundles,
  (allSwundles) => dateSort(Object.values(allSwundles), 'desc', 'createdAt')
)
export const getSwundle = createItemSelector(getAllSwundles, selectItemId, (allSwundles, id) => allSwundles[id])

export const getCurrentSwundle = createSelector(
  getAllSwundlesArray,
  (swundleList) => swundleList.filter(({ sent }) => !sent)[0] // Most recent unsent
)
export const getCurrentSwundleId = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.id : '')
export const isCurrentSwundleSigning = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.signing : false)
export const isCurrentSwundleSending = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.sending : false)
export const isCurrentSwundleSent = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.sent : false)
export const getCurrentSwundleCreatedDate = createSelector(getCurrentSwundle, (swundle) => swundle ? swundle.createdAt : new Date(0))
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
  (swaps) => swaps.some(getSwapRequiresSigning))

export const isCurrentSwundleReadyToSign = createSelector(getCurrentSwundleSwaps,
  (swaps) => swaps.every(getSwapReadyToSign))

export const isCurrentSwundleReadyToSend = createSelector(getCurrentSwundleSwaps,
  (swaps) => swaps.every(getSwapReadyToSend))

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

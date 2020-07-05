import { createSelector } from 'reselect'
import {
  getSwapRequiresSigning, getSwapReadyToSign, getSwapReadyToSend,
} from 'Utilities/swap'
import { getAllWalletIds } from 'Selectors/wallet'

import { getAllSwapsArray, getSwap } from 'Common/selectors/swap'
import { getAllTxs } from './tx'

export * from 'Common/selectors/swap'

export const getSentSwaps = createSelector(
  getAllSwapsArray,
  (allSwaps) => allSwaps
    .filter(({ orderStatus, tx, isManual }) =>
      orderStatus !== 'awaiting deposit' ||
      tx.sent ||
      (isManual && orderStatus !== 'awaiting deposit'))
)

export const getConnectedWalletSentSwaps = createSelector(
  getSentSwaps,
  getAllWalletIds,
  (sentSwaps, walletIds) => sentSwaps.filter(({ receiveWalletId, sendWalletId }) =>
    walletIds.some((id) => id === receiveWalletId || id === sendWalletId))
)

export const getConnectedWalletsCompletedSwaps = createSelector(
  getConnectedWalletSentSwaps,
  (swaps) => swaps.filter(({ status: { code } }) =>
    code === 'complete' || code === 'failed')
)

export const getConnectedWalletsPendingSwaps = createSelector(
  getConnectedWalletSentSwaps,
  (swaps) => swaps.filter(({ status: { code } }) =>
    code === 'pending')
)

export const getSentSwapOrderTxIds = createSelector(
  getAllSwapsArray,
  getAllTxs,
  (allSwapsArray, allTxs) => allSwapsArray.reduce((byId, swap) => {
    const tx = allTxs[swap.txId]
    if (tx && tx.sent) {
      return {
        ...byId,
        [swap.orderId]: tx.id,
      }
    }
    return byId
  }, {})
)

export const doesSwapRequireSigning = createSelector(getSwap, (swap) => getSwapRequiresSigning(swap))

export const isSwapReadyToSign = createSelector(getSwap, getSwapReadyToSign)

export const isSwapReadyToSend = createSelector(getSwap, getSwapReadyToSend)

export const isSwapSigning = createSelector(getSwap, (swap) => Boolean(swap && swap.txSigning))

export const isSwapSent = createSelector(getSwap, (swap) => Boolean(swap && swap.sent))

export const isSwapSending = createSelector(getSwap, (swap) => Boolean(swap && swap.txSending))

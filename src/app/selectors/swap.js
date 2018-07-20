import { createSelector } from 'reselect'
import { mapValues } from 'Utilities/helpers'
import { getSwapStatus, getSwapFriendlyError, estimateReceiveAmount } from 'Utilities/swap'
import { createItemSelector, selectItemId } from 'Utilities/selector'
import { toBigNumber } from 'Utilities/convert'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'

export const getSwapState = ({ swap }) => swap

const createSwapExtender = (allAssets, allWallets) => (swap) => {
  const { sendWalletId, sendSymbol, receiveSymbol, fee } = swap
  const tx = swap.tx || {}
  const { receipt, feeSymbol: txFeeSymbol, feeAmount: txFeeAmount } = tx
  const sendAsset = allAssets[sendSymbol]
  const receiveAsset = allAssets[receiveSymbol]
  const txFeeAsset = allAssets[txFeeSymbol]
  const txFeeFiat = txFeeAsset && txFeeAmount ? txFeeAsset.price.times(txFeeAmount) : undefined
  swap = {
    ...swap,
    sendAsset,
    receiveAsset,
    hasFee: fee && toBigNumber(fee).gt(0),
    tx: {
      ...tx,
      signingSupported: (allWallets[sendWalletId] || {}).isSignTxSupported,
      confirmed: receipt && receipt.confirmed,
      succeeded: receipt && receipt.succeeded,
      feeAsset: txFeeAsset,
      feeFiat: txFeeFiat,
    }
  }
  return {
    ...swap,
    receiveUnits: estimateReceiveAmount(swap),
    status: getSwapStatus(swap),
    friendlyError: getSwapFriendlyError(swap),
  }
}

export const getAllSwaps = createSelector(
  getSwapState,
  getAllAssets,
  getAllWallets,
  (allSwaps, allAssets, allWallets) => mapValues(allSwaps, createSwapExtender(allAssets, allWallets)))
export const getAllSwapsArray = createSelector(getAllSwaps, Object.values)
export const getSwap = createItemSelector(getAllSwaps, selectItemId, (allSwaps, id) => allSwaps[id])

export const getSwapOrder = createItemSelector(getSwap, (swap) => swap ? swap.order : null)

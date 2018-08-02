import { createSelector } from 'reselect'
import { mapValues } from 'Utilities/helpers'
import { getSwapStatus, getSwapFriendlyError, estimateReceiveAmount } from 'Utilities/swap'
import { createItemSelector, selectItemId } from 'Utilities/selector'
import { toBigNumber } from 'Utilities/convert'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'

export const getSwapState = ({ swap }) => swap

const createSwapExtender = (allAssets, allWallets, allTxs) => (swap) => {
  const { sendSymbol, receiveSymbol, fee, txId } = swap
  const sendAsset = allAssets[sendSymbol]
  const receiveAsset = allAssets[receiveSymbol]
  const tx = allTxs[txId] || {}
  swap = {
    ...swap,
    pair: `${sendSymbol}_${receiveSymbol}`.toLowerCase(),
    sendAsset,
    receiveAsset,
    hasFee: fee && toBigNumber(fee).gt(0),
    tx,
    txSigning: tx.signing,
    txSigned: tx.signed,
    txSigningError: tx.signingError,
    txSending: tx.sending,
    txSent: tx.sent,
    txSendingError: tx.sendingError,
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
  getAllTxs,
  (allSwaps, allAssets, allWallets, allTxs) => mapValues(allSwaps, createSwapExtender(allAssets, allWallets, allTxs)))
export const getAllSwapsArray = createSelector(getAllSwaps, Object.values)
export const getSwap = createItemSelector(getAllSwaps, selectItemId, (allSwaps, id) => allSwaps[id])

export const getSwapOrder = createItemSelector(getSwap, (swap) => swap ? swap.order : null)

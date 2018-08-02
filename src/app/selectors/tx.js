import { createSelector } from 'reselect'

import { mapValues } from 'Utilities/helpers'
import { createItemSelector, selectItemId } from 'Utilities/selector'

import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'

export const getTxState = ({ tx }) => tx

const createTxExtender = (allAssets, allWallets) => (tx) => {
  const { walletId, receipt, feeSymbol, feeAmount } = tx
  const feeAsset = allAssets[feeSymbol]
  const feeFiat = feeAsset && feeAmount ? feeAsset.price.times(feeAmount) : undefined
  return {
    ...tx,
    signingSupported: (allWallets[walletId] || {}).isSignTxSupported,
    confirmed: receipt && receipt.confirmed,
    succeeded: receipt && receipt.succeeded,
    feeAsset: feeAsset,
    feeFiat: feeFiat,
  }
}

export const getAllTxs = createSelector(
  getTxState,
  getAllAssets,
  getAllWallets,
  (txState, allAssets, allWallets) => mapValues(txState, createTxExtender(allAssets, allWallets)))
export const getAllTxsArray = createSelector(getAllTxs, Object.values)
export const getTx = createItemSelector(getAllTxs, selectItemId, (allTxs, id) => allTxs[id])

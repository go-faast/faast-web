import { createSelector } from 'reselect'
import { mapValues, dateSort } from 'Utilities/helpers'
import { createItemSelector, selectItemId } from 'Utilities/selector'
import { toBigNumber } from 'Utilities/convert'
import { MultiWallet } from 'Services/Wallet'
import { formatDate } from 'Utilities/display'
import {
  getSwapStatus, getSwapFriendlyError,
} from 'Utilities/swap'

import { getAllAssets } from 'Common/selectors/asset'
import { getAllWallets } from 'Selectors/wallet'
import { getAllTxs } from 'Selectors/tx'

export const getSwapState = ({ swap }) => swap

export const createSwapExtender = (allAssets, allWallets, allTxs) => (swap) => {
  const { sendSymbol, receiveSymbol, txId, rate, receiveAddress, sendWalletId, rateLockedUntil } = swap
  const sendAsset = allAssets[sendSymbol]
  const receiveAsset = allAssets[receiveSymbol]
  const tx = allTxs[txId] || {}
  const fee = toBigNumber(0)
  let { receiveWalletId } = swap
  let receiveWallet
  if (!receiveWalletId) {
    receiveWallet = Object.values(allWallets)
      .find((w) => !w.type.includes(MultiWallet.type)
        && (w.usedAddresses.includes(receiveAddress)
          || (swap.receiveAddress.startsWith('0x')
            && w.usedAddresses.includes(receiveAddress.toLowerCase()))))
    if (receiveWallet) {
      receiveWalletId = receiveWallet.id
    }
  }
  const sendWallet = allWallets[sendWalletId]
  const isManual = !sendWallet || sendWallet.isReadOnly

  swap = {
    ...swap,
    sendAmount: swap.sendAmount || swap.depositAmount,
    isManual,
    isFixedPrice: Boolean(rateLockedUntil),
    sendWallet,
    receiveWallet,
    receiveWalletId,
    pair: `${sendSymbol}_${receiveSymbol}`.toLowerCase(),
    inverseRate: toBigNumber(rate).pow(-1),
    sendAsset,
    receiveAsset,
    fee,
    hasFee: fee && fee.gt(0),
    createdAtFormatted: formatDate(swap.createdAt, 'yyyy-MM-dd hh:mm:ss'),
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
    status: getSwapStatus(swap),
    friendlyError: getSwapFriendlyError(swap),
  }
}

export const getAllSwaps = createSelector(
  getSwapState,
  getAllAssets,
  getAllWallets,
  getAllTxs,
  (allSwaps, allAssets, allWallets, allTxs) => mapValues(allSwaps, createSwapExtender(allAssets, allWallets, allTxs))
)

export const getSwap = createItemSelector(
  getAllSwaps,
  selectItemId,
  (allSwaps, id) => allSwaps[id] || Object.values(allSwaps).find((s) => s.orderId === id)
)

export const getSwapError = createSelector(getSwap, (swap) => swap && swap.error)

export const getAllSwapsArray = createSelector(
  getAllSwaps,
  (allSwaps) => dateSort(Object.values(allSwaps), 'desc', 'createdAt')
)
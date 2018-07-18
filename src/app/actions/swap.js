import { isObject, isArray, isUndefined, mergeWith } from 'lodash'

import { newScopedCreateAction } from 'Utilities/action'
import { processArray } from 'Utilities/helpers'
import { restoreFromAddress } from 'Utilities/storage'
import log from 'Utilities/log'
import {
  toBigNumber,
  toPrecision,
  toUnit,
  ZERO,
  BigNumber
} from 'Utilities/convert'
import toastr from 'Utilities/toastrWrapper'
import walletService from 'Services/Wallet'

import { getMarketInfo, postExchange, getOrderStatus, getSwundle, removeSwundle } from 'Actions/request'
import { getWalletPassword } from 'Actions/walletPasswordPrompt'

import { getAsset, getCurrentWallet, getAllWalletsArray, getAllSwapsArray, getSwap } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const setSwaps = createAction('SET_ALL')
export const resetSwaps = createAction('RESET_ALL')
export const swapUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))
export const swapOrderUpdated = createAction('ORDER_UPDATED', (id, data) => ({ id, order: data }))

export const swapTxUpdated = createAction('TX_UPDATED', (id, data) => ({ id, tx: data }))

export const swapTxSigningStart = createAction('TX_SIGNING_START', (id) => ({ id }))
export const swapTxSigningSuccess = createAction('TX_SIGNING_SUCCESS', (id, updatedTx) => ({ id, tx: updatedTx }))
export const swapTxSigningFailed = createAction('TX_SIGNING_FAILED', (id, errorMessage) => ({ id, signingError: errorMessage }))

export const swapTxSendingStart = createAction('TX_SENDING_START', (id) => ({ id }))
export const swapTxSendingSuccess = createAction('TX_SENDING_SUCCESS', (id, updatedTx) => ({ id, tx: updatedTx }))
export const swapTxSendingFailed = createAction('TX_SENDING_FAILED', (id, errorMessage) => ({ id, sendingError: errorMessage }))

const clearAllIntervals = () => {
  Object.keys(window.faast.intervals).forEach((key) => {
    window.faast.intervals[key].forEach(a => window.clearInterval(a))
  })
}

export const forgetCurrentOrder = () => (dispatch, getState) => {
  const wallet = getCurrentWallet(getState())
  clearAllIntervals()
  dispatch(resetSwaps())
  dispatch(removeSwundle(wallet && wallet.id))
}


const createSwapFinish = (dispatch, type, swap, additions) => (errorMessage, moreAdditions) => {
  const updatedFields = {}
  if (errorMessage) {
    updatedFields.error = errorMessage
    updatedFields.errorType = type
  }
  if (additions) {
    Object.assign(updatedFields, additions)
  }
  if (moreAdditions) {
    Object.assign(updatedFields, moreAdditions)
  }
  if (updatedFields && Object.keys(updatedFields).length > 0) {
    dispatch(swapUpdated(swap.id, updatedFields))
    return { ...swap, ...updatedFields }
  }
  return swap
}

const swapMarketInfo = (swapList) => (dispatch) => {
  log.debug('swapMarketInfo', swapList)
  return processArray(swapList, (swap) => {
    if (swap.error) return swap
    const { sendSymbol, sendUnits, receiveSymbol, pair } = swap
    const newFields = {}
    const finish = createSwapFinish(dispatch, 'swapMarketInfo', swap, newFields)
    if (sendSymbol === receiveSymbol) return finish('cannot swap to same asset')

    return dispatch(getMarketInfo(pair))
      .then((res) => {
        log.debug('marketinfo response', res)
        if (!res.pair) {
          return finish('Error getting market info')
        }
        if (res.hasOwnProperty('rate')) {
          newFields.rate = toBigNumber(res.rate)
        } else {
          return finish('Error getting market rate')
        }
        if (res.hasOwnProperty('outgoing_network_fee')) {
          newFields.fee = toBigNumber(res.outgoing_network_fee)
        } else if (res.hasOwnProperty('minerFee')) {
          newFields.fee = toBigNumber(res.minerFee)
        } else {
          return finish('Error getting swap fee')
        }
        if (res.hasOwnProperty('minimum') && sendUnits.lessThan(res.minimum)) {
          return finish(`Minimum amount is ${res.minimum} ${sendSymbol}`)
        }
        if (res.hasOwnProperty('min') && sendUnits.lessThan(res.min)) {
          return finish(`Minimum amount is ${res.min} ${sendSymbol}`)
        }
        if ((res.hasOwnProperty('limit') && sendUnits.greaterThan(res.limit)) || (res.maxLimit && sendUnits.greaterThan(res.maxLimit))) {
          return finish(`Maximum amount is ${res.limit} ${sendSymbol}`)
        }
        return finish()
      })
      .catch((e) => {
        log.error(e)
        return finish('Error getting market info')
      })
  })
}

const swapPostExchange = (swapList) => (dispatch) => {
  log.debug('swapPostExchange', swapList)
  const walletPreviousTx = {}
  return processArray(swapList, (swap) => {
    if (swap.error) return swap
    const finish = createSwapFinish(dispatch, 'swapPostExchange', swap)
    const finishErrorHandler = (message) => (e) => {
      log.error(e)
      return finish(message)
    }
    const { sendWalletId, sendSymbol, sendUnits, receiveWalletId, receiveSymbol, pair } = swap
    const sendWalletInstance = walletService.get(sendWalletId)
    const receiveWalletInstance = walletService.get(receiveWalletId)
    return Promise.all([
      sendWalletInstance.getFreshAddress(sendSymbol),
      receiveWalletInstance.getFreshAddress(receiveSymbol),
    ])
    .catch(finishErrorHandler('Error retrieving wallet addresses'))
    .then(([returnAddress, withdrawalAddress]) => dispatch(postExchange({
      pair,
      withdrawal: withdrawalAddress,
      returnAddress,
    })))
    .catch(finishErrorHandler('Error creating swap orders'))
    .then((order) =>
      sendWalletInstance.createTransaction(order.deposit, sendUnits, sendSymbol, { previousTx: walletPreviousTx[sendWalletId] })
        .then((tx) => {
          walletPreviousTx[sendWalletId] = tx
          return finish(null, { sendUnits: tx.amount, order, tx })
        }))
    .catch(finishErrorHandler('Error generating deposit txn'))
  })
}

// Checks to see if the deposit is high enough for the rate and swap fee
// so the expected amount ends up larger than zero
const swapSufficientDeposit = (swapList) => (dispatch, getState) => {
  return processArray(swapList, (swap) => {
    if (swap.error) return swap
    const { sendUnits, receiveSymbol, rate, fee } = swap
    const finish = createSwapFinish(dispatch, 'swapSufficientDeposit', swap)
    const receiveAsset = getAsset(getState(), receiveSymbol)
    const expected = toPrecision(toUnit(sendUnits, rate, receiveAsset.decimals).minus(fee), receiveAsset.decimals)
    if (expected.lessThanOrEqualTo(0)) {
      return finish('Estimated amount to receive is below 0')
    }
    return finish()
  })
}

const mergeSum = (...args) => mergeWith(...args, (a, b) => {
  if (a instanceof BigNumber) {
    return a.plus(b)
  }
})

// Checks to see if there will be enough balance to pay tx fees
const swapSufficientFees = (swapList) => (dispatch, getState) => {
  const walletBalances = getAllWalletsArray(getState())
    .reduce((byId, { id, balances }) => ({ ...byId, [id]: { ...balances } }), {})
  // Calculate the total amount and feeAmount by wallet and asset symbol
  const walletSendTotals = {}
  swapList.forEach((swap) => {
    if (swap.error) return
    const { sendWalletId, sendSymbol, tx } = swap
    const { amount, feeAmount, feeSymbol } = tx
    mergeSum(walletSendTotals, { [sendWalletId]: { [sendSymbol]: { amount: amount } } })
    if (feeAmount) {
      mergeSum(walletSendTotals, { [sendWalletId]: { [feeSymbol]: { feeAmount: feeAmount } } })
    }
  }, {})
  // Log all insufficient balances for debugging purposes
  Object.entries(walletSendTotals).forEach(([walletId, sendTotals]) => {
    Object.entries(sendTotals).forEach(([symbol, { amount: totalAmount, feeAmount: totalFee }]) => {
      totalAmount = totalAmount || ZERO
      totalFee = totalFee || ZERO
      const balance = (walletBalances[walletId] || {})[symbol] || ZERO
      if (balance.minus(totalAmount).minus(totalFee).isNegative()) {
        log.debug(`Insufficient ${symbol} balance in wallet ${walletId}. ` +
          `balance=${balance}, totalAmount=${totalAmount}, totalFee=${totalFee}`)
      }
    })
  })
  return processArray(swapList, (swap) => {
    if (swap.error) return swap
    const finish = createSwapFinish(dispatch, 'swapSufficientFees', swap)
    const { sendWalletId, tx } = swap
    const { feeSymbol } = tx
    const balance = walletBalances[sendWalletId][feeSymbol]
    let { amount: totalAmount, feeAmount: totalFee } = walletSendTotals[sendWalletId][feeSymbol]
    totalAmount = totalAmount || ZERO
    totalFee = totalFee || ZERO
    const requiredBalance = totalAmount.plus(totalFee)
    const leftOverBalance = balance.minus(requiredBalance)
    if (leftOverBalance.isNegative()) {
      return finish(`Not enough ${feeSymbol} for tx fee`)
    }
    return finish()
  })
}

export const initiateSwaps = (swapList) => (dispatch) => {
  log.info('swap submit initiated', swapList)
  swapList = swapList.map((swap) => ({
    ...swap,
    pair: `${swap.sendSymbol}_${swap.receiveSymbol}`.toLowerCase()
  }))
  return dispatch(swapMarketInfo(swapList))
    .then((a) => dispatch(swapPostExchange(a)))
    .then((a) => dispatch(swapSufficientDeposit(a)))
    .then((a) => dispatch(swapSufficientFees(a)))
}

const createTransferEventListeners = (swap) => (dispatch) => {
  const { id: swapId } = swap
  let txId
  return {
    onTxHash: (txHash) => {
      log.info(`tx hash ${txHash} obtained for swap ${swapId}`)
      txId = txHash
      dispatch(swapTxUpdated(swapId, { id: txId }))
    },
    onReceipt: (receipt) => {
      log.info(`tx receipt obtained for swap ${swapId}`)
      dispatch(swapTxUpdated(swapId, { receipt }))
    },
    onConfirmation: (conf) => {
      dispatch(swapTxUpdated(swapId, { confirmations: conf }))
    },
    onError: (e) => {
      log.error(`tx error for swap ${swapId}`, e)
      const message = e.message || e
      // Don't mark the following as a tx error, start polling for receipt instead
      if (message.includes('Transaction was not mined within')) {
        return dispatch(pollTransactionReceipt(swap, txId))
      }
      const declined = message.includes('User denied transaction signature')
      dispatch(swapUpdated(swapId, {
        declined,
        error: message,
        errorType: 'sendTransaction',
      }))
    }
  }
}

export const signSwapTxs = (swapList) => (dispatch) => {
  log.debug('signSwapTxs', swapList)
  const passwordCache = {}
  return processArray(swapList, (swap) => {
    const { id, tx, sendWalletId } = swap
    const walletInstance = walletService.get(sendWalletId)
    if (!walletInstance.isSignTransactionSupported()) {
      return
    }
    dispatch(swapTxSigningStart(id))

    const passwordPromise = (isUndefined(passwordCache[sendWalletId]) && walletInstance.isPasswordProtected())
      ? dispatch(getWalletPassword(sendWalletId))
      : Promise.resolve(passwordCache[sendWalletId])

    return passwordPromise
      .then((password) => {
        passwordCache[sendWalletId] = password
        return walletInstance.signTransaction(tx, { password })
      })
      .then((signedTx) => dispatch(swapTxSigningSuccess(id, signedTx)).payload)
      .catch((e) => {
        log.error(`signSwapTxs error for swap ${id}`, e)
        const message = e.message
        toastr.error(message)
        dispatch(swapTxSigningFailed(id, message))
        return swap
      })
  })
}

export const sendSwapTxs = (swapList, sendOptions) => (dispatch) => {
  log.debug('sendSwapTxs', swapList)
  return processArray(swapList, (swap) => {
    const { id, tx, sendWalletId } = swap
    const eventListeners = dispatch(createTransferEventListeners(swap))
    const walletInstance = walletService.get(sendWalletId)
    dispatch(swapTxSendingStart(id))

    return walletInstance.sendTransaction(tx, { ...eventListeners, ...sendOptions })
      .then((sentTx) => {
        dispatch(pollTransactionReceipt(swap))
        dispatch(pollOrderStatus(swap))
        return dispatch(swapTxSendingSuccess(id, sentTx)).payload
      })
      .catch((e) => {
        log.error(`sendSwapTxs error for swap ${id}`, e)
        dispatch(swapTxSendingFailed(id, 'Error sending swap transaction'))
        return swap
      })
  })
}

const updateOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`updateOrderStatus: swap ${id} has no orderId`)
    return
  }
  return dispatch(getOrderStatus(orderId))
    .then((order) => {
      dispatch(swapOrderUpdated(id, order))
      return order
    })
    .catch(log.error)
}

const isOrderFinalized = (order) => order && (order.status === 'complete' || order.status === 'failed')

export const pollOrderStatus = (swap) => (dispatch) => {
  const { id, orderId } = swap
  if (!orderId) {
    log.info(`pollOrderStatus: swap ${id} has no orderId`)
    return
  }
  const orderStatusInterval = window.setInterval(() => {
    dispatch(updateOrderStatus(swap))
      .then((order) => {
        if (isOrderFinalized(order)) {
          clearInterval(orderStatusInterval)
        }
      })
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

const updateSwapTxReceipt = (swap) => (dispatch) => {
  const { id, tx, sendWalletId } = swap
  const walletInstance = walletService.get(sendWalletId)
  if (!walletInstance) {
    log.error(`Failed to get swap sendWallet ${sendWalletId}`)
    return
  }
  return walletInstance.getTransactionReceipt(tx)
    .then((receipt) => {
      if (receipt) {
        log.info('tx receipt obtained')
        dispatch(swapTxUpdated(id, { receipt }))
      }
      return receipt
    })
    .catch((e) => log.error(`failed to get swap ${id} transaction receipt`, e))
}

export const pollTransactionReceipt = (swap) => (dispatch) => {
  const { id: swapId, tx: { id: txId } } = swap
  if (!txId) {
    log.info(`pollTransactionReceipt: swap ${swapId} has no txId`)
    return
  }
  const receiptInterval = window.setInterval(() => {
    dispatch(updateSwapTxReceipt(swap))
      .then((receipt) => {
        if (receipt && receipt.confirmed) {
          clearInterval(receiptInterval)
        }
      })
  }, 5000)

  window.faast.intervals.txReceipt.push(receiptInterval)
}

export const restoreSwapPolling = () => (dispatch, getState) => {
  const swapList = getAllSwapsArray(getState())
  swapList.forEach((swap) => {
    Promise.all([
      updateSwapTxReceipt(swap),
      updateOrderStatus(swap)
    ]).then(() => {
      swap = getSwap(getState(), swap.id)
      const { status, order } = swap
      if (status.detailsCode === 'pending_receipt') {
        dispatch(pollTransactionReceipt(swap))
      }
      if (!isOrderFinalized(order)) {
        dispatch(pollOrderStatus(swap))
      }
    })
  })
}

export const restoreSwundle = (swundle) => (dispatch) => {
  let swapList
  if (validateSwundleV2(swundle)) {
    swapList = Array.isArray(swundle.swap) ? swundle.swap : Object.values(swundle.swap)
    swapList = swapList.map((swap) => ({
      ...swap,
      restored: true
    }))
  } else if (validateSwundleV1(swundle)) {
    swapList = swundle.reduce((swapList, send) => [
      ...swapList,
      ...send.list.map((receive) => ({
        sendWalletId: send.walletId,
        sendSymbol: send.symbol,
        sendUnits: toBigNumber(receive.unit),
        receiveWalletId: receive.walletId,
        receiveSymbol: receive.symbol,
        fee: toBigNumber(receive.fee),
        order: receive.order,
        rate: toBigNumber(receive.rate),
        tx: {
          id: receive.txHash,
          ...(receive.tx || {})
        },
        restored: true
      })),
    ], [])
  }
  if (swapList) {
    dispatch(setSwaps(swapList))
    dispatch(restoreSwapPolling())
  }
}

export const restoreSwapsForWallet = (walletId) => (dispatch) => {
  const state = restoreFromAddress(walletId)

  if (state) {
    dispatch(restoreSwundle(state))
  } else {
    dispatch(getSwundle(walletId))
      .then((data) => {
        if (data && data.result) {
          dispatch(restoreSwundle(data.result))
        }
      })
  }
}

const validateSwundleV1 = (swundle) => {
  if (!swundle) return false
  if (!isArray(swundle)) return false
  const sendSymbols = []
  return swundle.every((send) => {
    if (!send.symbol) return false
    if (sendSymbols.includes(send.symbol)) return false
    sendSymbols.push(send.symbol)
    return send.list.every((receive) => {
      const receiveSymbols = []
      if (!receive.symbol) return false
      if (receiveSymbols.includes(receive.symbol)) return false
      if (toBigNumber(receive.unit).lessThanOrEqualTo(0)) return false
      if (!receive.order) return false
      return true
    })
  })
}

const validateSwundleV2 = (swundle) => {
  if (!swundle) return false
  if (!isObject(swundle)) return false
  const { swap } = swundle
  return swap !== null && (isArray(swap) || isObject(swap))
}

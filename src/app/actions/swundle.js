import uuid from 'uuid/v4'
import { mergeWith, groupBy } from 'lodash'

import log from 'Utilities/log'
import { newScopedCreateAction, idPayload } from 'Utilities/action'
import { processArray } from 'Utilities/helpers'
import { ZERO, BigNumber } from 'Utilities/convert'

import {
  addSwap, removeSwap, restoreSwapPolling,
  createOrder, createSwapTx, signSwap, sendSwap, setSwapTx,
  swapError,
} from 'Actions/swap'
import { createAggregateTx } from 'Actions/tx'
import { getAllWallets, getSwundle, getCurrentSwundle, getLatestSwundle } from 'Selectors'
import walletService from 'Services/Wallet'

const createAction = newScopedCreateAction(__filename)

export const swundlesRestored = createAction('SET_ALL')
export const swundleAdded = createAction('ADDED', (swundle) => ({
  ...swundle,
  swaps: swundle.swaps.map((swap) => typeof swap === 'string' ? swap : swap.id)
}))
export const swundleRemoved = createAction('REMOVED', idPayload)
export const swundleDismissed = createAction('DISMISSED', idPayload)

export const initStarted = createAction('INIT_STARTED', idPayload)
export const initSuccess = createAction('INIT_SUCCESS', idPayload)
export const initFailed = createAction('INIT_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))

export const signStarted = createAction('SIGN_STARTED', idPayload)
export const signSuccess = createAction('SIGN_SUCCESS', idPayload)
export const signFailed = createAction('SIGN_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))

export const sendStarted = createAction('SEND_STARTED', idPayload)
export const sendSuccess = createAction('SEND_SUCCESS', idPayload)
export const sendFailed = createAction('SEND_FAILED', (id, errorMessage) => ({ id, error: errorMessage }))

const forEachSwap = (swundle, handler) => processArray(swundle.swaps, handler)
  .then((swaps) => ({ ...swundle, swaps }))

const mergeSum = (...args) => mergeWith(...args, (a, b) => {
  if (a instanceof BigNumber) {
    return a.plus(b)
  }
})

export const removeSwundle = (swundleOrId) => (dispatch, getState) => {
  let id = typeof swundleOrId !== 'string' ? swundleOrId.id : swundleOrId
  const swundle = getSwundle(getState(), id)
  if (!swundle) {
    return
  }
  dispatch(swundleRemoved(id))
  swundle.swaps.forEach((swap) => dispatch(removeSwap(swap)))
}

const clearAllIntervals = () => {
  Object.keys(window.faast.intervals).forEach((key) => {
    window.faast.intervals[key].forEach(a => window.clearInterval(a))
  })
}

export const removeCurrentSwundle = () => (dispatch, getState) => {
  const current = getCurrentSwundle(getState())
  if (current) {
    dispatch(removeSwundle(current))
  }
}

export const dismissLatestSwundle = () => (dispatch, getState) => {
  const latest = getLatestSwundle(getState())
  if (latest) {
    clearAllIntervals()
    dispatch(swundleDismissed(latest.id))
  }
}

// Checks to see if there will be enough balance to pay tx fees
const checkSufficientBalances = (swundle) => (dispatch, getState) => {
  const allWallets = getAllWallets(getState())
  const walletBalances = Object.values(allWallets)
    .reduce((byId, { id, balances }) => ({ ...byId, [id]: { ...balances } }), {})
  // Calculate the total amount and feeAmount by wallet and asset symbol
  const walletSendTotals = {}
  swundle.swaps.forEach((swap) => {
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
      const amountPlusFee = totalAmount.plus(totalFee)
      if (balance.minus(amountPlusFee).isNegative()) {
        log.debug(`Insufficient ${symbol} balance in wallet ${walletId}. ` +
          `balance=${balance}, totalAmount=${totalAmount}, totalFee=${totalFee}`)
        const label = (allWallets[walletId] || {}).label || walletId
        throw new Error(`Insufficient ${symbol} balance in wallet ${label} for transaction fees.`)
      }
    })
  })
  return swundle
}

const createSwundleTxs = (swundle, options) => (dispatch, getState) => {
  log.debug('createSwundleTxs', swundle)
  const swapsByWallet = groupBy(swundle.swaps, 'sendWalletId')
  log.debug('swapsByWallet', swapsByWallet)

  return Promise.all(Object.entries(swapsByWallet).map(([walletId, walletSwaps]) => {
    const walletInstance = walletService.getOrThrow(walletId)
    const swapsByAsset = groupBy(walletSwaps, 'sendSymbol')
    log.debug('swapsByAsset', swapsByAsset)

    let previousTx // Used to track eth tx nonce

    return processArray(Object.entries(swapsByAsset), ([symbol, swaps]) => {
      if (walletInstance.isAggregateTransactionSupported(symbol)) {
        if (swaps.some((swap) => swap.error)) { return }
        // Create a single aggregate transaction for multiple swaps (e.g. bitcoin, litecoin)
        const outputs = swaps.map(({ sendAmount, depositAddress }) => ({
          address: depositAddress,
          amount: sendAmount,
        }))
        return dispatch(createAggregateTx(walletId, outputs, symbol, options))
          .then((tx) => Promise.all(swaps.map((swap, i) => dispatch(setSwapTx(swap.id, tx, i)))))
          .catch((e) => {
            log.error(e)
            swaps.forEach((swap) => dispatch(swapError(swap.id, 'Error creating swap transaction', 'createSwapTx')))
            throw new Error('Error creating swap transactions')
          })
      } else {
        // Create a transaction for each swap (e.g. ethereum)
        return processArray(swaps, (swap) => dispatch(createSwapTx(swap, { ...options, previousTx }))
          .then((tx) => {
            if (!tx.error && tx.feeSymbol === 'ETH') {
              previousTx = tx
            }
          }))
      }
    })
  })).then(() => getSwundle(getState(), swundle.id))
}

export const initSwundle = (swundle) => (dispatch) => Promise.resolve().then(() => {
  log.debug('initSwundle', swundle.id)
  dispatch(initStarted(swundle.id))
  return Promise.resolve(swundle)
    .then((s) => dispatch(checkSufficientBalances(s)))
    .then((s) => forEachSwap(s, (swap) => dispatch(createOrder(swap))))
    .then((s) => dispatch(createSwundleTxs(s)))
    .then((s) => {
      dispatch(initSuccess(swundle.id))
      return s
    })
    .catch((e) => {
      log.error('initSwundle error', e)
      dispatch(initFailed(swundle.id, e.message || e))
    })
})

export const createSwundle = (newSwaps) => (dispatch, getState) => {
  const id = uuid()
  log.debug('createSwundle', id, newSwaps)
  return Promise.all(newSwaps.map((swap) => dispatch(addSwap(swap))))
    .then((swaps) => {
      dispatch(swundleAdded({
        id,
        createdAt: new Date(),
        swaps: swaps
      }))
      return getSwundle(getState(), id)
    })
    .then((swundle) => dispatch(initSwundle(swundle)))
    .catch((e) => {
      log.error('createSwundle error', e)
    })
}

export const signSwundle = (swundle) => (dispatch, getState) => {
  log.debug('signSwundle', swundle.id)
  const passwordCache = {}
  dispatch(signStarted(swundle.id))
  return forEachSwap(swundle, (swap) => dispatch(signSwap(swap, passwordCache)))
    .then(() => {
      dispatch(signSuccess(swundle.id))
      return getSwundle(getState(), swundle.id)
    })
    .catch((e) => {
      dispatch(signFailed(swundle.id, e.message))
      throw e
    })
}

export const sendSwundle = (swundle, sendOptions) => (dispatch, getState) => {
  log.debug('sendSwundle', swundle.id)
  dispatch(sendStarted(swundle.id))
  return forEachSwap(swundle, (swap) => dispatch(sendSwap(swap, sendOptions)))
    .then(() => {
      dispatch(sendSuccess(swundle.id))
      return getSwundle(getState(), swundle.id)
    })
    .catch((e) => {
      dispatch(sendFailed(swundle.id, e.message))
      throw e
    })
}

export const restoreLatestSwundlePolling = () => (dispatch, getState) => {
  const latestSwundle = getLatestSwundle(getState())
  if (!latestSwundle || latestSwundle.dismissed) {
    return
  }
  latestSwundle.swaps.forEach((swap) => dispatch(restoreSwapPolling(swap.id)))
}

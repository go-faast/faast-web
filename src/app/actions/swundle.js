import uuid from 'uuid/v4'
import { isObject, isArray, mergeWith } from 'lodash'

import log from 'Utilities/log'
import { restoreFromAddress } from 'Utilities/storage'
import { newScopedCreateAction, idPayload } from 'Utilities/action'
import { processArray } from 'Utilities/helpers'
import { ZERO, BigNumber, toBigNumber } from 'Utilities/convert'

import {
  setSwaps, addSwap, removeSwap, restoreSwapPolling,
  updateMarketInfo, checkSufficientDeposit, createOrder,
  createSwapTx, signSwap, sendSwap,
} from 'Actions/swap'
import { getAllWallets, getSwundle, getCurrentSwundle, getLatestSwundle } from 'Selectors'

const createAction = newScopedCreateAction(__filename)

export const setSwundles = createAction('SET_ALL')
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

const createSwundleTxs = (swundle) => (dispatch) => {
  log.debug('createSwundleTxs', swundle.id)
  const walletPreviousEthTx = {}
  return forEachSwap(swundle, (swap) => dispatch(createSwapTx(swap, walletPreviousEthTx)))
}

export const initSwundle = (swundle) => (dispatch) => Promise.resolve().then(() => {
  log.info('initSwundle', swundle.id)
  dispatch(initStarted(swundle.id))
  return Promise.all(swundle.swaps
    .map((swap) => dispatch(updateMarketInfo(swap))
      .then((swap) => dispatch(checkSufficientDeposit(swap)))))
    .then((swaps) => ({ ...swundle, swaps }))
    .then((s) => dispatch(checkSufficientBalances(s)))
    .then((s) => forEachSwap(s, (swap) => dispatch(createOrder(swap))))
    .then((s) => dispatch(createSwundleTxs(s)))
    .then((s) => {
      dispatch(initSuccess(swundle.id))
      return s
    })
    .catch((e) => {
      log.error('initSwundle error', e)
      dispatch(initFailed(swundle.id, e.message))
    })
})

export const createSwundle = (newSwaps) => (dispatch, getState) => {
  const id = uuid()
  log.info('createSwundle', id, newSwaps)
  return Promise.all(newSwaps.map((swap) => dispatch(addSwap(swap))))
    .then((swaps) => {
      dispatch(swundleAdded({
        id,
        createdDate: Date.now(),
        swaps: swaps
      }))
      return getSwundle(getState(), id)
    })
    .then((swundle) => dispatch(initSwundle(swundle)))
    .catch((e) => {
      log.error('createSwundle error', e)
    })
}

export const signSwundle = (swundle) => (dispatch) => {
  log.debug('signSwundle', swundle.id)
  const passwordCache = {}
  dispatch(signStarted(swundle.id))
  return forEachSwap(swundle, (swap) => {
    if (swap.txSigned) {
      return swap
    }
    return dispatch(signSwap(swap, passwordCache))
  }).then((result) => {
    dispatch(signSuccess(swundle.id))
    return result
  })
  .catch((e) => {
    dispatch(signFailed(swundle.id, e.message))
    throw e
  })
}

export const sendSwundle = (swundle, sendOptions) => (dispatch) => {
  log.debug('sendSwundle', swundle.id)
  dispatch(sendStarted(swundle.id))
  return forEachSwap(swundle, (swap) => {
    if (swap.txSent) {
      return swap
    }
    return dispatch(sendSwap(swap, sendOptions))
  }).then((result) => {
    dispatch(sendSuccess(swundle.id))
    return result
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
  latestSwundle.swaps.forEach((swap) => dispatch(restoreSwapPolling(swap)))
}

export const restoreSwundles = (state) => (dispatch) => {
  let swapList
  let hasSwundle = false
  if (validateSwundleV2(state)) {
    swapList = Array.isArray(state.swap) ? state.swap : Object.values(state.swap)
    dispatch(setSwaps(swapList))
    if (state.swundle) {
      hasSwundle = true
      dispatch(setSwundles(state.swundle))
    }
  } else if (validateSwundleV1(state)) {
    swapList = state.reduce((swapList, send) => [
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
        }
      })),
    ], [])
    dispatch(setSwaps(swapList))
  }
  if (swapList && !hasSwundle) {
    const createdDate = ((swapList[0] || {}).order || {}).created || Date.now()
    dispatch(swundleAdded({
      id: uuid(),
      createdDate,
      swaps: swapList
    }))
  }
  dispatch(restoreLatestSwundlePolling())
}

export const restoreSwapsForWallet = (walletId) => (dispatch) => {
  const state = restoreFromAddress(walletId)

  if (state) {
    dispatch(restoreSwundles(state))
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

const validateSwundleV2 = (state) => {
  if (!state) return false
  if (!isObject(state)) return false
  const { swap } = state
  return swap !== null && (isArray(swap) || isObject(swap))
}

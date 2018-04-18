import { createAction } from 'redux-act'
import { isObject, isArray } from 'lodash'

import config from 'Config'
import { processArray } from 'Utilities/helpers'
import { getSwapStatus, statusAllSwaps } from 'Utilities/swap'
import { restoreFromAddress } from 'Utilities/storage'
import log from 'Utilities/log'
import {
  toBigNumber,
  toHex,
  toPrecision,
  toUnit,
  ZERO
} from 'Utilities/convert'
import {
  getTransactionReceipt,
  getTransaction
} from 'Utilities/wallet'
import walletService, { MultiWallet } from 'Services/Wallet'

import {
  swapUpdated, swapTxUpdated, swapOrderUpdated, setSwaps,
  swapTxSigningStart, swapTxSigningSuccess, swapTxSigningFailed
} from 'Actions/swap'
import { getMarketInfo, postExchange, getOrderStatus, getSwundle } from 'Actions/request'
import {
  addWallet, removeWallet, addNestedWallet, restoreAllWallets, updateWalletBalances,
} from 'Actions/wallet'
import { retrieveAssetPrices } from 'Actions/asset'

import { getAsset, getAllWalletsArray, getAllSwapsArray } from 'Selectors'

const { defaultPortfolioId } = config

export { defaultPortfolioId }

export const setCurrentPortfolio = createAction('SET_CURRENT_PORTFOLIO', (portfolioId) => ({ portfolioId }))
export const setCurrentWallet = createAction('SET_CURRENT_WALLET', (portfolioId, walletId) => ({ portfolioId, walletId }))
export const portfolioAdded = createAction('PORTFOLIO_ADDED')

export const removePortfolio = (id) => (dispatch) => Promise.resolve()
  .then(() => {
    if (id === defaultPortfolioId) {
      throw new Error('Cannot delete default portfolio');
    }
    return dispatch(removeWallet(id))
  })

export const addPortfolio = (walletInstance, setCurrent = false) => (dispatch) => Promise.resolve()
  .then(() => dispatch(addWallet(walletInstance)))
  .then((wallet) => {
    dispatch(portfolioAdded(wallet.id))
    if (setCurrent) {
      dispatch(setCurrentPortfolio(wallet.id))
    }
    return wallet
  })

export const createNewPortfolio = (setCurrent = false) => (dispatch) => Promise.resolve()
  .then(() => dispatch(addPortfolio(new MultiWallet(), setCurrent)))

const createDefaultPortfolio = () => (dispatch) => Promise.resolve()
  .then(() => {
    const wallet = new MultiWallet(defaultPortfolioId)
    wallet.setPersistAllowed(false)
    wallet.setLabel('My Portfolio')
    return dispatch(addPortfolio(wallet, false))
  })

export const restoreAllPortfolios = () => (dispatch) => dispatch(restoreAllWallets())
  .then((plainWallets) => dispatch(createDefaultPortfolio())
    .then(() => Promise.all(plainWallets.map(({ id, type }) => {
      if (type === MultiWallet.type) {
        dispatch(portfolioAdded(id))
      } else {
        return dispatch(addNestedWallet(defaultPortfolioId, id))
      }
    }))))

export const updateHoldings = (walletId) => (dispatch) => {
  return Promise.all([
    dispatch(retrieveAssetPrices()),
    dispatch(updateWalletBalances(walletId)),
  ]).catch(log.error)
}

export const updateAllHoldings = () => (dispatch) => {
  return Promise.all([
    dispatch(retrieveAssetPrices()),
    dispatch(updateWalletBalances(defaultPortfolioId)),
  ]).catch(log.error)
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
          return finish('error getting market info')
        }
        if (res.hasOwnProperty('rate')) {
          newFields.rate = toBigNumber(res.rate)
        } else {
          return finish('error getting market rate')
        }
        if (res.hasOwnProperty('outgoing_network_fee')) {
          newFields.fee = toBigNumber(res.outgoing_network_fee)
        } else if (res.hasOwnProperty('minerFee')) {
          newFields.fee = toBigNumber(res.minerFee)
        } else {
          return finish('error getting swap fee')
        }
        if (res.hasOwnProperty('minimum') && sendUnits.lessThan(res.minimum)) {
          return finish(`minimum amount is ${res.minimum} ${sendSymbol}`)
        }
        if (res.hasOwnProperty('min') && sendUnits.lessThan(res.min)) {
          return finish(`minimum amount is ${res.min} ${sendSymbol}`)
        }
        if ((res.hasOwnProperty('limit') && sendUnits.greaterThan(res.limit)) || (res.maxLimit && sendUnits.greaterThan(res.maxLimit))) {
          return finish(`maximum amount is ${res.limit} ${sendSymbol}`)
        }
        return finish()
      })
      .catch((e) => {
        log.error(e)
        return finish('error getting market info')
      })
  })
}

const swapPostExchange = (swapList) => (dispatch) => {
  log.debug('swapPostExchange', swapList)
  let previousTx = null
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
    .catch(finishErrorHandler('error retrieving wallet addresses'))
    .then(([returnAddress, withdrawalAddress]) => dispatch(postExchange({
      pair,
      withdrawal: withdrawalAddress,
      returnAddress,
    })))
    .catch(finishErrorHandler('error creating swaps'))
    .then((order) =>
      sendWalletInstance.createTransaction(order.deposit, sendUnits, sendSymbol, { previousTx })
        .then((tx) => {
          previousTx = tx
          return finish(null, { order, tx })
        }))
    .catch(finishErrorHandler('error generating swap tx'))
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

// Checks to see if there will be enough Ether if the full gas amount is paid
const swapSufficientFees = (swapList) => (dispatch, getState) => {
  let walletAdjustedBalances = getAllWalletsArray(getState())
    .reduce((byId, { id, balances }) => ({ ...byId, [id]: balances }), {})
  return processArray(swapList, (swap) => {
    if (swap.error) return swap
    const finish = createSwapFinish(dispatch, 'swapSufficientFees', swap)
    const { sendWalletId, sendSymbol, sendUnits, tx } = swap
    const { feeAmount, feeAsset } = tx
    const adjustedBalances = walletAdjustedBalances[sendWalletId] || {}
    adjustedBalances[sendSymbol] = (adjustedBalances[sendSymbol] || ZERO).minus(sendUnits)
    if (feeAmount) {
      adjustedBalances[feeAsset] = (adjustedBalances[feeAsset] || ZERO).minus(feeAmount)
      if (adjustedBalances[feeAsset].isNegative()) {
        return finish(`Not enough ${feeAsset} for tx fee`)
      }
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

const createTransferEventListeners = (swap, markSigned) => (dispatch) => {
  const { id: swapId } = swap
  let txId
  return {
    onTxHash: (txHash) => {
      log.info(`tx hash ${txHash} obtained for swap ${swapId}`)
      txId = txHash
      dispatch(swapTxUpdated(swapId, { id: txId }))
      if (markSigned) dispatch(swapTxUpdated(swapId, { signed: true, sent: true }))
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

export const sendSwapDeposits = (swapList, sendOptions) => (dispatch) => {
  log.debug('sendSwapDeposits', swapList)
  return processArray(swapList, (swap) => {
    const eventListeners = dispatch(createTransferEventListeners(swap, true))
    const walletInstance = walletService.get(swap.sendWalletId)
    const { id } = swap
    dispatch(swapTxSigningStart(id))
    return walletInstance.sendTransaction(swap.tx, { ...eventListeners, ...sendOptions })
      .then(() => {
        dispatch(swapTxSigningSuccess(id))
        return dispatch(pollOrderStatus(swap))
      })
      .catch((e) => dispatch(swapTxSigningFailed(id, e.message)))
  })
}

export const pollOrderStatus = (swap) => (dispatch) => {
  const orderStatusInterval = window.setInterval(() => {
    dispatch(getOrderStatus(swap))
      .then((order) => {
        dispatch(swapOrderUpdated(swap.id, order))
        if (order && (order.status === 'complete' || order.status === 'failed')) {
          return window.clearInterval(orderStatusInterval)
        }
      })
      .catch(log.error)
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

export const pollTransactionReceipt = (swap) => (dispatch) => {
  const { id: swapId, tx: { id: txId } } = swap
  if (!txId) {
    const error = new Error('txId is missing, unable to poll for receipt')
    log.error(error)
    return dispatch(swapUpdated(swapId, { error }))
  }
  const receiptInterval = window.setInterval(() => {
    getTransactionReceipt(txId)
    .then((receipt) => {
      if (receipt) {
        window.clearInterval(receiptInterval)
        log.info('tx receipt obtained')
        dispatch(swapTxUpdated(swapId, { receipt }))
        dispatch(pollOrderStatus(swap))
      }
    })
    .catch(log.error)
  }, 5000)

  window.faast.intervals.txReceipt.push(receiptInterval)
}

export const restoreSwapPolling = () => (dispatch, getState) => {
  const swapList = getAllSwapsArray(getState())
  swapList.forEach((swap) => {
    const status = getSwapStatus(swap)
    if (status.detailsCode === 'pending_receipt') {
      dispatch(pollTransactionReceipt(swap))
    } else if (status.code === 'pending') {
      dispatch(pollOrderStatus(swap))
    }
  })
}

export const restoreSwundle = (swundle) => (dispatch) => {
  let swapList
  if (validateSwundleV2(swundle)) {
    swapList = swundle.swaps.map((swap) => ({
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
    processArray(swundle, (swap) =>
      getTransaction(swap.tx.id)
        .then((tx) => {
          dispatch(swapTxUpdated(swap.id, {
            gasPrice: toHex(tx.gasPrice),
            signed: true,
            sent: true,
          }))
        })
        .catch(log.error))
    // .then(() => {
      // receipt polling restoration is done in App component
      // when statusAllSwaps changes to pending_receipts_restored
    // })
    .catch(log.error)
  }
}

export const restoreSwapsForWallet = (walletId) => (dispatch) => {
  const state = restoreFromAddress(walletId)

  if (state && state.swap && state.swap.length) {
    const status = statusAllSwaps(state.swap)
    const swapState = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : state.swap

    if (swapState) {
      dispatch(setSwaps(swapState))
      dispatch(restoreSwapPolling())
    }
  } else {
    dispatch(getSwundle(walletId))
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
      if (!receive.order || !receive.order.deposit || !receive.order.orderId) return false
      return true
    })
  })
}

const validateSwundleV2 = (swundle) => {
  if (!swundle) return false
  if (!isObject(swundle)) return false
  return swundle.version === '2'
}

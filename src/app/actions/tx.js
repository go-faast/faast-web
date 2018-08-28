import { isUndefined, identity } from 'lodash'
import uuid from 'uuid/v4'

import { getWalletPassword } from 'Actions/walletPasswordPrompt'
import { newScopedCreateAction } from 'Utilities/action'
import walletService from 'Services/Wallet'
import { getTx } from 'Selectors'
import log from 'Log'

const createAction = newScopedCreateAction(__filename)

export const txsRestored = createAction('ALL_RESTORED')
export const txRestored = createAction('RESTORED')
export const txAdded = createAction('ADDED')
export const txRemoved = createAction('REMOVED')
export const txUpdated = createAction('UPDATED', (id, data) => ({ id, ...data }))

export const txHashUpdated = createAction('HASH_UPDATED', (id, hash) => ({ id, hash }))
export const txReceiptUpdated = createAction('RECEIPT_UPDATED', (id, receipt) => ({ id, receipt }))
export const txConfirmationsUpdated = createAction('CONFIRMATIONS_UPDATED', (id, confirmations) => ({ id, confirmations }))

export const txSigningStart = createAction('SIGNING_START', (id) => ({ id }))
export const txSigningSuccess = createAction('SIGNING_SUCCESS', (updatedTx) => updatedTx)
export const txSigningFailed = createAction('SIGNING_FAILED', (id, errorMessage) => ({ id, signingError: errorMessage }))

export const txSendingStart = createAction('SENDING_START', (id) => ({ id }))
export const txSendingSuccess = createAction('SENDING_SUCCESS', (updatedTx) => updatedTx)
export const txSendingFailed = createAction('SENDING_FAILED', (id, errorMessage) => ({ id, sendingError: errorMessage }))

export const restoreTxs = (txs) => (dispatch) => {
  dispatch(txsRestored(txs))
}

const newTxErrorHandler = (dispatch, tx, methodName, failureAction, filterMessage = identity) => (e) => {
  log.error(`${methodName} error for tx ${tx.id}`, e)
  const message = filterMessage(e.message)
  if (!message) {
    return tx
  }
  dispatch(failureAction(tx.id, message))
  if (message !== e.message) {
    throw new Error(message)
  }
  throw e
}

export const addTx = (tx) => (dispatch) => {
  tx.id = tx.id || uuid()
  return dispatch(txAdded(tx)).payload
}

export const createAggregateTx = (walletId, outputs, assetSymbol, options) => (dispatch) => Promise.resolve().then(() => {
  const walletInstance = walletService.getOrThrow(walletId)
  return walletInstance.createAggregateTransaction(outputs, assetSymbol, options)
    .then((tx) => dispatch(addTx(tx)))
})

export const createTx = (walletId, address, amount, assetSymbol, options) => (dispatch) => Promise.resolve().then(() => {
  const walletInstance = walletService.get(walletId)
  if (!walletInstance) {
    throw new Error(`Cannot get wallet ${walletId}`)
  }
  return walletInstance.createTransaction(address, amount, assetSymbol, options)
    .then((tx) => dispatch(addTx(tx)))
})

export const signTx = (tx, passwordCache) => (dispatch) => Promise.resolve().then(() => {
  log.debug('signTx', tx)
  const { walletId } = tx
  const walletInstance = walletService.getOrThrow(walletId)
  if (!walletInstance.isSignTransactionSupported()) {
    return
  }
  dispatch(txSigningStart(tx.id))

  const passwordPromise = (isUndefined(passwordCache[walletId]) && walletInstance.isPasswordProtected())
    ? dispatch(getWalletPassword(walletId))
    : Promise.resolve(passwordCache[walletId])

  return passwordPromise
    .then((password) => {
      passwordCache[walletId] = password
      return walletInstance.signTransaction(tx, { password })
    })
    .then((signedTx) => dispatch(txSigningSuccess(signedTx)).payload)
    .catch(newTxErrorHandler(dispatch, tx, 'signTx', txSigningFailed))
})

const newSendTxEventListeners = (txId) => (dispatch) => ({
  onTxHash: (hash) => {
    log.info(`tx hash ${hash} obtained for tx ${txId}`)
    dispatch(txHashUpdated(txId, hash))
  },
  onReceipt: (receipt) => {
    log.info(`tx receipt obtained for tx ${txId}`)
    dispatch(txReceiptUpdated(txId, receipt))
  },
  onConfirmation: (conf) => {
    // dispatch(txConfirmationsUpdated(txId, conf))
  }
})

export const sendTx = (tx, sendOptions) => (dispatch) => Promise.resolve().then(() => {
  log.debug('sendTx', tx, sendOptions)
  const { walletId } = tx
  const eventListeners = dispatch(newSendTxEventListeners(tx.id))
  const walletInstance = walletService.getOrThrow(walletId)
  dispatch(txSendingStart(tx.id))

  return walletInstance.sendTransaction(tx, { ...eventListeners, ...sendOptions })
    .then((sentTx) => {
      dispatch(pollTxReceipt(tx.id))
      return dispatch(txSendingSuccess(sentTx)).payload
    })
    .catch(newTxErrorHandler(dispatch, tx, 'sendTx', txSendingFailed, (message) => {
      if (message.includes('User denied transaction signature') || message.includes('denied by the user')) {
        return 'Transaction was rejected'
      }
      return message.replace('Returned error: ', '')
    }))
})


export const updateTxReceipt = (txId) => (dispatch, getState) => {
  const tx = getTx(getState(), txId)
  if (!tx) {
    log.error(`updateTxReceipt: failed to get tx ${txId}`)
    return
  }
  const { walletId } = tx
  const walletInstance = walletService.get(walletId)
  if (!walletInstance) {
    log.error(`updateTxReceipt: failed to get wallet ${walletId}`)
    return
  }
  return walletInstance.getTransactionReceipt(tx)
    .then((receipt) => {
      if (receipt) {
        log.info('tx receipt obtained', receipt)
        dispatch(txReceiptUpdated(txId, receipt))
      }
      return receipt
    })
    .catch((e) => log.error(`failed to get tx ${txId} receipt`, e))
}

export const pollTxReceipt = (txId) => (dispatch) => {
  const receiptInterval = window.setInterval(() => {
    dispatch(updateTxReceipt(txId))
      .then((receipt) => {
        if (receipt && receipt.confirmed) {
          clearInterval(receiptInterval)
        }
      })
  }, 5000)

  window.faast.intervals.txReceipt.push(receiptInterval)
}

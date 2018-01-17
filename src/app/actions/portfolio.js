
import { insertSwapData, updateSwapTx, setSwap, setWallet, walletOpened, resetAll } from 'Actions/redux'
import { getMarketInfo, postExchange, getOrderStatus, getSwundle } from 'Actions/request'
import { mockTransaction, mockPollTransactionReceipt, mockPollOrderStatus, clearMockIntervals } from 'Actions/mock'
import { processArray } from 'Utilities/helpers'
import { getSwapStatus, statusAllSwaps } from 'Utilities/swap'
import { restoreFromAddress } from 'Utilities/storage'
import log from 'Utilities/log'
import blockstack from 'Utilities/blockstack'
import {
  toBigNumber,
  toHex,
  toPrecision,
  toUnit
} from 'Utilities/convert'
import {
  getTransactionReceipt,
  getTransaction
} from 'Utilities/wallet'
import { MultiWallet } from 'Services/Wallet'
import walletService from 'Services/Wallet'

export const getCurrentWallet = () => (dispatch, getState) => {
  const walletId = ((getState ? getState() : {}).wallet || {}).id
  let wallet
  if (walletId) {
    wallet = walletService.get(walletId)
  } else {
    Object.values(walletService.getAll())[0]
  }
  return wallet
}

export const setCurrentWallet = (walletId) => (dispatch) => {
  const wallet = walletService.get(walletId)
  if (!wallet) {
    log.error('failed to set current wallet to', walletId)
    return
  }
  dispatch(setWallet({
    id: wallet.getId(),
    type: wallet.type,
    address: wallet.getAddress && wallet.getAddress(),
    opened: wallet.type === 'MultiWallet' ? wallet.wallets.length : 1,
    isBlockstack: wallet.isBlockstack
  }))
}

const swapFinish = (type, swap, error, addition) => {
  return (dispatch) => {
    const errors = swap.errors || []
    if (error) {
      errors.push({ [type]: new Error(error) })
      dispatch(insertSwapData(swap.from, swap.to, { errors }))
    }
    return Object.assign({}, swap, addition, { errors })
  }
}

const swapMarketInfo = (swapList) => (dispatch) => {
  return processArray(swapList, (a) => {
    const finish = (e, x) => dispatch(swapFinish('swapMarketInfo', a, e, x))
    if (a.from === a.to) return finish('cannot swap to same asset')

    return dispatch(getMarketInfo(a.pair))
      .then((res) => {
        log.debug('marketinfo response', res)
        if (!res.pair) {
          return finish('error getting details')
        }
        if (res.hasOwnProperty('minimum') && a.amount.lessThan(res.minimum)) {
          return finish(`minimum amount is ${res.minimum}`)
        }
        if (res.hasOwnProperty('min') && a.amount.lessThan(res.min)) {
          return finish(`minimum amount is ${res.min}`)
        }
        if ((res.hasOwnProperty('limit') && a.amount.greaterThan(res.limit)) || (res.maxLimit && a.amount.greaterThan(res.maxLimit))) {
          return finish(`maximum amount is ${res.limit}`)
        }
        const fee = res.hasOwnProperty('outgoing_network_fee') ? toBigNumber(res.outgoing_network_fee) : toBigNumber(res.minerFee)
        const rate = toBigNumber(res.rate)
        dispatch(insertSwapData(a.from, a.to, {
          rate,
          fee
        }))
        return finish(null, { rate, fee })
      })
      .catch((e) => {
        log.error(e)
        return finish('error getting details')
      })
  })
}

const swapPostExchange = (swapList, portfolio, address) => (dispatch) => {
  return processArray(swapList, (swap) => {
    const finish = (e, x) => dispatch(swapFinish('swapPostExchange', swap, e, x))

    return dispatch(postExchange({ withdrawal: address, pair: swap.pair, returnAddress: address }))
      .then((order) => {
        const fromAsset = order.depositType.toUpperCase()
        const toAsset = order.withdrawalType.toUpperCase()
        return dispatch(getCurrentWallet()).createTransaction(order.deposit, swap.amount, fromAsset)
          .then((tx) => {
            dispatch(insertSwapData(fromAsset, toAsset, {
              order,
              tx
            }))
            return finish(null, { order, tx })
          })
      })
      .catch((e) => {
        log.error(e)
        return finish('problem generating tx')
      })
  })
}

// Checks to see if the deposit is high enough for the rate and swap fee
// so the expected amount ends up larger than zero
const swapSufficientDeposit = (swapList, portfolio) => (dispatch) => {
  return processArray(swapList, (a) => {
    const finish = (e, x) => dispatch(swapFinish('swapSufficientDeposit', a, e, x))

    const to = portfolio.list.find(b => b.symbol === a.to)
    const expected = toPrecision(toUnit(a.amount, a.rate, to.decimals).minus(a.fee), to.decimals)
    if (expected.lessThanOrEqualTo(0)) {
      return finish('insufficient deposit for expected return')
    }
    return finish()
  })
}

// Checks to see if there will be enough Ether if the full gas amount is paid
const swapSufficientEther = (swapList, portfolio) => (dispatch) => {
  let etherBalance = portfolio.list.find(a => a.symbol === 'ETH').balance
  return processArray(swapList, (a) => {
    const finish = (e, x) => dispatch(swapFinish('swapSufficientEther', a, e, x))

    if (a.from === 'ETH') etherBalance = etherBalance.minus(a.amount)
    etherBalance = etherBalance.minus(a.tx.feeAmount)
    if (etherBalance.isNegative()) {
      return finish('not enough ether for tx fee')
    }
    return finish()
  })
}

export const initiateSwaps = (swap, portfolio, address) => (dispatch) => {
  log.info('swap submit initiated')
  const swapList = swap.reduce((a, b) => {
    return a.concat(b.list.map((c) => {
      return {
        from: b.symbol,
        to: c.symbol,
        amount: c.unit,
        pair: b.symbol.toLowerCase() + '_' + c.symbol.toLowerCase()
      }
    }))
  }, [])
  return dispatch(swapMarketInfo(swapList))
    .then((a) => dispatch(swapPostExchange(a, portfolio, address)))
    .then((a) => dispatch(swapSufficientDeposit(a, portfolio)))
    .then((a) => dispatch(swapSufficientEther(a, portfolio)))
}

const createTransferEventListeners = (dispatch, send, receive, markSigned) => {
  let txId
  return {
    onTxHash: (txHash) => {
      log.info(`tx hash obtained - ${txHash}`)
      txId = txHash
      dispatch(insertSwapData(send.symbol, receive.symbol, { txHash }))
      if (markSigned) dispatch(updateSwapTx(send.symbol, receive.symbol, { signed: true }))
    },
    onReceipt: (receipt) => {
      log.info('tx receipt obtained')
      dispatch(updateSwapTx(send.symbol, receive.symbol, { receipt }))
    },
    onConfirmation: (conf) => {
      log.info(`tx confirmation obtained - ${conf}`)
      dispatch(updateSwapTx(send.symbol, receive.symbol, { confirmations: conf }))
    },
    onError: (error) => {
      log.error(error)
      // Don't mark the following as a tx error, start polling for receipt instead
      if (error.message.includes('Transaction was not mined within')) {
        return dispatch(pollTransactionReceipt(send, receive, txId))
      }
      const declined = error.message.includes('User denied transaction signature')
      dispatch(insertSwapData(send.symbol, receive.symbol, { error, declined }))
    }
  }
}

export const sendSwapDeposits = (swap, options, isMocking) => (dispatch) => {
  return processArray(swap, (send) => {
    return processArray(send.list, (receive) => {
      if (isMocking) {
        return dispatch(mockTransaction(send, receive))
      }
      const eventListeners = createTransferEventListeners(dispatch, send, receive, true)
      return dispatch(getCurrentWallet()).sendTransaction(receive.tx, { ...eventListeners, ...options })
        .then(() => dispatch(pollOrderStatus(send, receive)))
    })
  })
}

export const pollOrderStatus = (send, receive) => (dispatch) => {
  const orderStatusInterval = window.setInterval(() => {
    dispatch(getOrderStatus(send.symbol, receive.symbol, receive.order.deposit, receive.order.created))
    .then((order) => {
      if (order && (order.status === 'complete' || order.status === 'failed')) {
        return window.clearInterval(orderStatusInterval)
      }
    })
    .catch(log.error)
  }, 10000)

  window.faast.intervals.orderStatus.push(orderStatusInterval)
}

export const pollTransactionReceipt = (send, receive, tx) => (dispatch) => {
  const txHash = tx || receive.txHash
  if (!txHash) {
    const error = new Error('tx hash is missing, unable to poll for receipt')
    log.error(error)
    return dispatch(insertSwapData(send.symbol, receive.symbol, { error }))
  }
  const receiptInterval = window.setInterval(() => {
    getTransactionReceipt(txHash)
    .then((receipt) => {
      if (receipt) {
        window.clearInterval(receiptInterval)
        log.info('tx receipt obtained')
        dispatch(updateSwapTx(send.symbol, receive.symbol, { receipt }))
        dispatch(pollOrderStatus(send, receive))
      }
    })
    .catch(log.error)
  }, 5000)

  window.faast.intervals.txReceipt.push(receiptInterval)
}

export const restorePolling = (swap, isMocking) => (dispatch) => {
  swap.forEach((send) => {
    if (send && send.list) {
      send.list.forEach((receive) => {
        const status = getSwapStatus(receive)
        if (status.details === 'waiting for transaction receipt') {
          if (isMocking) {
            dispatch(mockPollTransactionReceipt(send, receive))
          } else {
            dispatch(pollTransactionReceipt(send, receive))
          }
        } else if (status.details === 'waiting for confirmations' || status.details === 'processing swap') {
          if (isMocking) {
            dispatch(mockPollOrderStatus(send, receive))
          } else {
            dispatch(pollOrderStatus(send, receive))
          }
        }
      })
    }
  })
}

export const openWallet = (wallet, isMocking) => (dispatch) => {
  let currentWallet = dispatch(getCurrentWallet())
  if (!currentWallet) {
    currentWallet = new MultiWallet()
    walletService.save(currentWallet)
    dispatch(setCurrentWallet(currentWallet))
  }
  const walletId = wallet.getId()
  if (walletId) {
    const state = restoreFromAddress(walletId)

    if (state && state.swap && state.swap.length) {
      const status = statusAllSwaps(state.swap)
      const swap = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : state.swap

      if (swap) {
        dispatch(setSwap(swap))
        dispatch(restorePolling(swap, isMocking))
      }
    } else {
      dispatch(getSwundle(walletId, isMocking))
    }
  }
  currentWallet.addWallet(wallet)
  walletService.save(currentWallet)
  dispatch(walletOpened(wallet))
}

export const closeWallet = (wallet) => (dispatch) => {
  clearAllIntervals()
  blockstack.signUserOut()
  dispatch(resetAll())
  if (wallet) {
    walletService.remove(wallet)
  } else {
    walletService.removeAll()
  }
  log.info('wallet closed')
}

export const restoreSwundle = (swundle) => (dispatch) => {
  if (validateSwundle(swundle)) {
    const newSwundle = swundle.map((send) => {
      return {
        symbol: send.symbol,
        list: send.list.map((receive) => {
          return {
            fee: toBigNumber(receive.fee),
            order: receive.order,
            rate: toBigNumber(receive.rate),
            symbol: receive.symbol,
            txHash: receive.txHash,
            unit: toBigNumber(receive.unit)
          }
        }),
        restored: true
      }
    })
    dispatch(setSwap(newSwundle))
    processArray(newSwundle, (send) => {
      return processArray(send.list, (receive) => {
        return getTransaction(receive.txHash)
          .then((tx) => {
            dispatch(updateSwapTx(send.symbol, receive.symbol, {
              gasPrice: toHex(tx.gasPrice),
              signed: true
            }))
          })
          .catch(log.error)
      })
    })
    // .then(() => {
      // receipt polling restoration is done in App component
      // when statusAllSwaps changes to pending_receipts_restored
    // })
    .catch(log.error)
  }
}

const validateSwundle = (swundle) => {
  if (!swundle) return false
  // if (swundle.version !== config.swundleVersion) return false // convert old to new swundle here
  if (!Array.isArray(swundle)) return false
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

export const clearAllIntervals = () => {
  clearMockIntervals()
  Object.keys(window.faast.intervals).forEach((key) => {
    window.faast.intervals[key].forEach(a => window.clearInterval(a))
  })
}

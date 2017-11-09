import { insertSwapData, updateSwapTx } from 'Actions/redux'
import { getMarketInfo, postExchange, getOrderStatus } from 'Actions/request'
import { mockTransaction } from 'Actions/mock'
import { processArray } from 'Utilities/helpers'
import log from 'Utilities/log'
import {
  toSmallestDenomination,
  toBigNumber,
  toHex,
  toTxFee,
  toPrecision,
  toUnit
} from 'Utilities/convert'
import {
  tokenTxData,
  signTxWithPrivateKey,
  signTxWithHardwareWallet,
  sendSignedTransaction
} from 'Utilities/wallet'

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

const swapMarketInfo = (swapList) => {
  return (dispatch) => {
    return processArray(swapList, (a) => {
      return new Promise((resolve, reject) => {
        const finish = (e, x) => {
          resolve(dispatch(swapFinish('swapMarketInfo', a, e, x)))
        }
        if (a.from === a.to) return finish('cannot swap to same asset')

        dispatch(getMarketInfo(a.pair))
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
          const fee = res.hasOwnProperty('outgoing_network_fee') ? res.outgoing_network_fee : res.minerFee
          dispatch(insertSwapData(a.from, a.to, {
            rate: res.rate,
            fee
          }))
          finish(null, { rate: res.rate, fee })
        })
        .catch((e) => {
          log.error(e)
          finish('error getting details')
        })
      })
    })
  }
}

const swapPostExchange = (swapList, portfolio, address) => {
  return (dispatch) => {
    return processArray(swapList, (a) => {
      return new Promise((resolve, reject) => {
        const finish = (e, x) => {
          resolve(dispatch(swapFinish('swapPostExchange', a, e, x)))
        }

        return dispatch(postExchange({ withdrawal: address, pair: a.pair, returnAddress: address }))
        .then((res) => {
          const sendAsset = portfolio.list.find((b) => b.symbol === res.depositType.toUpperCase())
          const value = sendAsset.symbol === 'ETH' ? toSmallestDenomination(a.amount, sendAsset.decimals) : toBigNumber(0)
          let data
          if (sendAsset.symbol === 'ETH') {
            data = ''
          } else {
            const tokenData = tokenTxData(res.deposit, a.amount, sendAsset.decimals)
            if (tokenData.error) {
              log.error(tokenData.error)
              return finish('problem generating tx')
            }
            data = tokenData.data
          }
          const tx = {
            from: address,
            to: sendAsset.symbol === 'ETH' ? res.deposit : sendAsset.contractAddress,
            value: toHex(value),
            data,
            chainId: 1
          }
          dispatch(insertSwapData(res.depositType.toUpperCase(), res.withdrawalType.toUpperCase(), {
            order: res,
            tx
          }))
          finish(null, { order: res, tx })
        })
        .catch((e) => {
          log.error(e)
          finish('problem generating tx')
        })
      })
    })
  }
}

const swapEstimateTxFee = (swapList, address) => {
  return (dispatch) => {
    return new Promise((resolve, reject) => {
      Promise.all([
        window.faast.web3.eth.getTransactionCount(address),
        window.faast.web3.eth.getGasPrice()
      ])
      .then((res) => {
        let nonce = res[0]
        const gasPrice = res[1]
        processArray(swapList, (a) => {
          return new Promise((resolve, reject) => {
            const finish = (e, x) => {
              resolve(dispatch(swapFinish('swapEstimateTxFee', a, e, x)))
            }

            if (!a.tx) return finish('no tx')
            if (!a.order) return finish('no order')

            window.faast.web3.eth.estimateGas({
              from: a.tx.from,
              to: a.tx.to,
              data: a.tx.data
            })
            .then((gasLimit) => {
              const txAdd = {
                nonce: toHex(nonce),
                gasPrice: toHex(gasPrice),
                gasLimit: toHex(gasLimit)
              }
              nonce = nonce + 1
              dispatch(updateSwapTx(a.order.depositType.toUpperCase(), a.order.withdrawalType.toUpperCase(), txAdd))
              finish(null, { tx: Object.assign({}, a.tx, txAdd) })
            })
            .catch((e) => {
              log.error(e)
              finish('problem estimating gas')
            })
          })
        })
        .then(resolve)
      })
      .catch((e) => {
        log.error(e)
        resolve(swapList)
      })
    })
  }
}

// Checks to see if the deposit is high enough for the rate and swap fee
// so the expected amount ends up larger than zero
const swapSufficientDeposit = (swapList, portfolio) => {
  return (dispatch) => {
    return processArray(swapList, (a) => {
      return new Promise((resolve, reject) => {
        const finish = (e, x) => {
          resolve(dispatch(swapFinish('swapSufficientDeposit', a, e, x)))
        }
        const to = portfolio.list.find(b => b.symbol === a.to)
        const expected = toPrecision(toUnit(a.amount, a.rate, to.decimals).minus(a.fee), to.decimals)
        if (expected.lessThanOrEqualTo(0)) return finish('insufficient deposit for expected return')

        finish()
      })
    })
  }
}

// Checks to see if there will be enough Ether if the full gas amount is paid
const swapSufficientEther = (swapList, portfolio) => {
  return (dispatch) => {
    let etherBalance = portfolio.list.find(a => a.symbol === 'ETH').balance
    return processArray(swapList, (a) => {
      return new Promise((resolve, reject) => {
        const finish = (e, x) => {
          resolve(dispatch(swapFinish('swapSufficientEther', a, e, x)))
        }
        if (a.from === 'ETH') etherBalance = etherBalance.minus(a.amount)
        etherBalance = etherBalance.minus(toTxFee(a.tx.gasLimit, a.tx.gasPrice))
        if (etherBalance.isNegative()) return finish('not enough ether for tx fee')
        return finish()
      })
    })
  }
}

export const initiateSwaps = (swap, portfolio, address) => {
  return (dispatch) => (
    new Promise((resolve, reject) => {
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
      dispatch(swapMarketInfo(swapList))
      .then((a) => dispatch(swapPostExchange(a, portfolio, address)))
      .then((a) => dispatch(swapSufficientDeposit(a, portfolio)))
      .then((a) => dispatch(swapEstimateTxFee(a, address)))
      .then((a) => dispatch(swapSufficientEther(a, portfolio)))
      .then(resolve)
      .catch(reject)
    })
  )
}

export const signTransactions = (swap, wallet, pk, isMocking) => {
  return (dispatch) => {
    return processArray(swap, (send) => {
      return processArray(send.list, (receive) => {
        return new Promise((resolve, reject) => {
          new Promise((resolve, reject) => {
            if (pk) {
              signTxWithPrivateKey(receive.tx, pk, isMocking)
              .then((signedTx) => {
                resolve(signedTx)
              })
              .catch(reject)
            } else if (wallet && wallet.hw) {
              signTxWithHardwareWallet(wallet.hw.type, wallet.hw.derivationPath, receive.tx, isMocking)
              .then((signedTx) => {
                resolve(signedTx)
              })
              .catch(reject)
            }
          })
          .then((signedTx) => {
            dispatch(updateSwapTx(send.symbol, receive.symbol, { signed: signedTx }))

            resolve(signedTx)
          })
          .catch(reject)
        })
      })
    })
  }
}

export const sendSignedTransactions = (swap, mock) => {
  return (dispatch) => {
    // new Promise((resolve, reject) => {
    swap.forEach((send) => {
      send.list.forEach((receive) => {
        if (mock) {
          dispatch(mockTransaction(send, receive))
        } else {
          if (receive.tx.signed) {
            sendSignedTransaction(receive.tx.signed)
            .on('transactionHash', (txHash) => {
              log.info(`tx hash obtained - ${txHash}`)
              dispatch(insertSwapData(send.symbol, receive.symbol, { txHash }))
            })
            .on('receipt', (receipt) => {
              log.info('tx receipt obtained')
              dispatch(updateSwapTx(send.symbol, receive.symbol, { receipt }))
              let orderStatusInterval
              orderStatusInterval = window.setInterval(() => {
                dispatch(getOrderStatus(send.symbol, receive.symbol, receive.order.deposit))
                .then((order) => {
                  if (order && (order.status === 'complete' || order.status === 'failed')) {
                    return window.clearInterval(orderStatusInterval)
                  }
                })
                .catch(log.error)
              }, 10000)
            })
            .on('confirmation', (conf) => {
              log.info(`tx confirmation obtained - ${conf}`)
              dispatch(updateSwapTx(send.symbol, receive.symbol, { confirmations: conf }))
            })
            .on('error', (error) => {
              log.error(error)
              dispatch(insertSwapData(send.symbol, receive.symbol, { error }))
            })
          } else {
            dispatch(insertSwapData(send.symbol, receive.symbol, { error: new Error('transaction not signed') }))
          }
        }
      })
    })
    // })
  }
}

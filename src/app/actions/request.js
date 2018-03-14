import { filterErrors, filterObj } from 'Utilities/helpers'
import { clearSwap } from 'Utilities/storage'
import log from 'Utilities/log'
import Faast from 'Services/Faast'
import { updateSwapOrder } from 'Actions/redux'
import { restoreSwundle } from 'Actions/portfolio'

export const getPriceChart = (symbol) => () => Faast.getPriceChart(symbol)

export const getMarketInfo = (pair) => () => Faast.getMarketInfo(pair)

export const postExchange = (info) => () => 
  Faast.postExchange(info)
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })

export const getOrderStatus = (depositSymbol, receiveSymbol, address, timestamp) => (dispatch) =>
  Faast.getOrderStatus(depositSymbol, receiveSymbol, address, timestamp)
    .then((data) => {
      log.info('order status receive', data)
      // if (data.error || !data.status) throw new Error(data.error)

      const order = filterObj(['status', 'transaction', 'outgoingCoin', 'error'], data)

      dispatch(updateSwapOrder(depositSymbol, receiveSymbol, order))
      return data
    })
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })

export const getSwundle = (address) => (dispatch) => 
  Faast.getSwundle(address)
    .then((data) => {
      if (data.result && data.result.swap) {
        dispatch(restoreSwundle(data.result.swap, address))
      }
    })
    .catch(log.error)

export const postSwundle = (address, swap) => () =>
  Faast.postSwundle(address, swap)
    .catch(log.error)

export const removeSwundle = (address) => () => {
  clearSwap(address)
  return Faast.removeSwundle(address)
    .catch(log.error)
}

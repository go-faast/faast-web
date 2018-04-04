import { filterErrors, filterObj } from 'Utilities/helpers'
import { clearSwap } from 'Utilities/storage'
import log from 'Utilities/log'
import Faast from 'Services/Faast'
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

export const getOrderStatus = ({ sendSymbol, receiveSymbol, order }) => () =>
  Faast.getOrderStatus(sendSymbol, receiveSymbol, order.deposit, order.created)
    .then((data) => {
      log.info('order status receive', data)
      // if (data.error || !data.status) throw new Error(data.error)
      return filterObj(['status', 'transaction', 'outgoingCoin', 'error'], data)
    })
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })

export const getSwundle = (id) => (dispatch) => 
  Faast.getSwundle(id)
    .then((data) => {
      if (data.result && data.result.swap) {
        dispatch(restoreSwundle(data.result.swap, id))
      }
    })
    .catch(log.error)

export const postSwundle = (id, swapList) => () =>
  Faast.postSwundle(id, { version: '2', swaps: swapList })
    .catch(log.error)

export const removeSwundle = (id) => () => {
  clearSwap(id)
  return Faast.removeSwundle(id)
    .catch(log.error)
}

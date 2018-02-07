
import { filterErrors, filterObj } from 'Utilities/helpers'
import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { clearSwap } from 'Utilities/storage'
import log from 'Utilities/log'
import { updateSwapOrder } from 'Actions/redux'
import { restoreSwundle } from 'Actions/portfolio'
import config from 'Config'

export const getPriceChart = (symbol) => () => {
  return fetchGet(`${config.siteUrl}/app/portfolio-chart/${symbol}`)
}

export const getMarketInfo = (pair) => () => {
  return fetchGet(`${config.apiUrl}/marketinfo/${pair}`)
}

export const postExchange = (info) => () => {
  return fetchPost(`${config.apiUrl}/shift`, info)
    .catch((err) => {
      log.error(err)
      const errMsg = filterErrors(err)
      throw new Error(errMsg)
    })
}

export const getOrderStatus = (depositSymbol, receiveSymbol, address, timestamp) => (dispatch) => {
  let url = `${config.apiUrl}/txStat/${address}`
  if (timestamp) url += `?after=${timestamp}`
  return fetchGet(url)
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
}

export const getSwundle = (address, isMocking) => (dispatch) => {
  let url = `${config.apiUrl}/swundle/${address}`
  return fetchGet(url)
    .then((data) => {
      if (data.result && data.result.swap) {
        dispatch(restoreSwundle(data.result.swap, address, isMocking))
      }
    })
    .catch(log.error)
}

export const postSwundle = (address, swap) => () => {
  const url = `${config.apiUrl}/swundle/${address}`
  return fetchPost(url, { swap })
    .catch(log.error)
}

export const removeSwundle = (address) => () => {
  clearSwap(address)
  const url = `${config.apiUrl}/swundle/${address}`
  return fetchDelete(url)
    .catch(log.error)
}

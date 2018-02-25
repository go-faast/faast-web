import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import log from 'Utilities/log'
import config from 'Config'

const { siteUrl, apiUrl } = config

const getAssets = () => fetchGet(`${siteUrl}/app/assets`)
  .then((assets) => assets.filter((asset) => {
    if (!asset.symbol) {
      log.warn('omitting asset without symbol', asset)
      return false
    }
    if (!asset.name) {
      log.warn('omitting asset without name', asset.symbol)
      return false
    }
    return true
  }))

const getAssetPrice = (symbol) => fetchGet(`${siteUrl}/app/portfolio-price/${symbol}`)

const getAssetPrices = () => fetchGet(`${siteUrl}/app/portfolio-price`)

const getPriceChart = (symbol) => fetchGet(`${siteUrl}/app/portfolio-chart/${symbol}`)

const getMarketInfo = (pair) => fetchGet(`${apiUrl}/marketinfo/${pair}`)

const postExchange = (info) => fetchPost(`${apiUrl}/shift`, info)

const getOrderStatus = (depositSymbol, receiveSymbol, address, timestamp) => {
  let url = `${apiUrl}/txStat/${address}`
  if (timestamp) url += `?after=${timestamp}`
  return fetchGet(url)
}

const getSwundle = (address) => fetchGet(`${apiUrl}/swundle/${address}`)

const postSwundle = (address, swap) => fetchPost(`${apiUrl}/swundle/${address}`, { swap })

const removeSwundle = (address) => fetchDelete(`${apiUrl}/swundle/${address}`)

export default {
  getAssets,
  getAssetPrice,
  getAssetPrices,
  getPriceChart,
  getMarketInfo,
  postExchange,
  getOrderStatus,
  getSwundle,
  postSwundle,
  removeSwundle,
}

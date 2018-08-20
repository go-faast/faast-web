import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import log from 'Utilities/log'
import config from 'Config'

import { Asset } from 'Types'

const { siteUrl, apiUrl } = config

function getAssets(): Promise<Asset[]> {
  return fetchGet(`${apiUrl}/currencies`)
    .then((assets: Array<Partial<Asset>>) => assets.filter((asset) => {
      if (!asset.symbol) {
        log.warn('omitting asset without symbol', asset)
        return false
      }
      if (!asset.name) {
        log.warn('omitting asset without name', asset.symbol)
        return false
      }
      return true
    }).map((asset) => {
      if (!asset.decimals) {
        asset.decimals = 0
      }
      return asset as Asset
    }))
}

const getAssetPrice = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-price/${symbol}`)

const getAssetPrices = () => fetchGet(`${siteUrl}/app/portfolio-price`)

const getPriceChart = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-chart/${symbol}`)

const getMarketInfo = (pair: string) => fetchGet(`${apiUrl}/marketinfo/${pair}`)

const postExchange = (info: object) => fetchPost(`${apiUrl}/shift`, info)

const getOrderStatus = (swapOrderId: string) => fetchGet(`${apiUrl}/txStat/${swapOrderId}`)

export default {
  getAssets,
  getAssetPrice,
  getAssetPrices,
  getPriceChart,
  getMarketInfo,
  postExchange,
  getOrderStatus,
}

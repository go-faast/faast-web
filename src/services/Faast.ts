import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import log from 'Utilities/log'
import config from 'Config'

import { Asset } from 'Types'

const { siteUrl, apiUrl } = config

function getAssets(): Promise<Asset[]> {
  return fetchGet(`${apiUrl}/api/v1/public/currencies`)
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

const getMarketInfo = (pair: string) => fetchGet(`${apiUrl}/api/v1/public/marketinfo/${pair}`)

type NewSwapArgs = {
  userId: string,
  sendAmount: number,
  sendSymbol: string,
  receiveAddress: string,
  receiveSymbol: string,
  refundAddress: string,
}

const postNewSwap = (
  { userId, sendAmount, sendSymbol, receiveAddress, receiveSymbol, refundAddress }: NewSwapArgs,
) => fetchPost(`${apiUrl}/api/v2/public/swap`, {
  user_id: userId,
  deposit_amount: sendAmount,
  deposit_currency: sendSymbol,
  withdrawal_address: receiveAddress,
  withdrawal_currency: receiveSymbol,
  refund_address: refundAddress,
})

const getOrderStatus = (swapOrderId: string) => fetchGet(`${apiUrl}/api/v1/public/txStat/${swapOrderId}`)

export default {
  getAssets,
  getAssetPrice,
  getAssetPrices,
  getPriceChart,
  getMarketInfo,
  postNewSwap,
  getOrderStatus,
}

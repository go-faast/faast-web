import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { filterErrors } from 'Utilities/helpers'
import log from 'Log'
import config from 'Config'

import { Asset } from 'Types'

const { siteUrl, apiUrl } = config

function fetchAssets(): Promise<Asset[]> {
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

const fetchAssetPrice = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-price/${symbol}`)

const fetchAssetPrices = () => fetchGet(`${siteUrl}/app/portfolio-price`)

const fetchPriceChart = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-chart/${symbol}`)

const fetchMarketInfo = (pair: string) => fetchGet(`${apiUrl}/api/v1/public/marketinfo/${pair}`)
  .then((result) => log.debugInline('getMarketInfo', result))

const postFixedPriceSwap = (
  sendAmount: number,
  sendSymbol: string,
  receiveAddress: string,
  receiveSymbol: string,
  refundAddress: string,
  userId: string,
): Promise<{
  orderId: string,
  status: string,
  createdAt: Date,
  depositAddress: string,
  sendUserId: string,
  sendAmount: number,
  sendSymbol: string,
  receiveAddress: string,
  receiveAmount: number,
  receiveSymbol: string,
  spotRate: number,
  rate: number,
  rateLockedAt: Date,
  rateLockedUntil: Date,
}> => fetchPost(`${apiUrl}/api/v2/public/swap`, {
  user_id: userId,
  deposit_amount: sendAmount,
  deposit_currency: sendSymbol,
  withdrawal_address: receiveAddress,
  withdrawal_currency: receiveSymbol,
  refund_address: refundAddress,
}).then((r) => log.debugInline(r))
  .then((r) => ({
    orderId: r.swap_id,
    status: r.status,
    createdAt: new Date(r.created_at),
    depositAddress: r.deposit_address,
    sendUserId: r.user_id,
    sendAmount: r.deposit_amount,
    sendSymbol: r.deposit_currency,
    receiveAddress: r.withdrawal_address,
    receiveAmount: r.withdrawal_amount,
    receiveSymbol: r.withdrawal_currency,
    spotRate: r.spot_price,
    rate: r.price,
    rateLockedAt: new Date(r.price_locked_at),
    rateLockedUntil: new Date(r.price_locked_until),
  }))
  .catch((err) => {
    log.error(err)
    const errMsg = filterErrors(err)
    throw new Error(errMsg)
  })

const fetchOrderStatus = (swapOrderId: string) => fetchGet(`${apiUrl}/api/v1/public/txStat/${swapOrderId}`)
  .then((result) => log.debugInline('getOrderStatus', result))
  .catch((err) => {
    log.error(err)
    const errMsg = filterErrors(err)
    throw new Error(errMsg)
  })

export default {
  fetchAssets,
  fetchAssetPrice,
  fetchAssetPrices,
  fetchPriceChart,
  fetchMarketInfo,
  postFixedPriceSwap,
  fetchOrderStatus,
}

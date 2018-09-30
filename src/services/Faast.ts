import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { filterErrors } from 'Utilities/helpers'
import log from 'Log'
import config from 'Config'

import { Asset, SwapOrder } from 'Types'

const { siteUrl, apiUrl } = config

export function fetchAssets(): Promise<Asset[]> {
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

export const fetchAssetPrice = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-price/${symbol}`)

export const fetchAssetPrices = () => fetchGet(`${siteUrl}/app/portfolio-price`)

export const fetchPriceChart = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-chart/${symbol}`)

export const fetchSwap = (swapId: string): Promise<SwapOrder> => {
  return fetchGet(`${apiUrl}/api/v2/public/swaps/${swapId}`)
    .then((swap) => log.debugInline('fetch swap:', swap))
    .then((swap) => formatOrderResult(swap))
    .catch((e) => {
      log.error(e)
      throw e
    })
}

export const fetchMarketInfo = (pair: string) => fetchGet(`${apiUrl}/api/v1/public/marketinfo/${pair}`)
  .then((result) => log.debugInline('fetchMarketInfo', result))

const formatOrderResult = (r: any): SwapOrder => ({
  orderId: r.swap_id,
  orderStatus: r.status,
  createdAt: r.created_at ? new Date(r.created_at) : null,
  updatedAt: r.updated_at ? new Date(r.updated_at) : null,
  depositAddress: r.deposit_address,
  sendWalletId: r.user_id,
  sendAmount: r.deposit_amount,
  sendSymbol: r.deposit_currency,
  receiveAddress: r.withdrawal_address,
  receiveAmount: r.withdrawal_amount,
  receiveSymbol: r.withdrawal_currency,
  refundAddress: r.refund_address,
  spotRate: r.spot_price,
  rate: r.price,
  rateLockedAt: r.price_locked_at ? new Date(r.price_locked_at) : null,
  rateLockedUntil: r.price_locked_until ? new Date(r.price_locked_until) : null,
  amountDeposited: r.amount_deposited,
  amountWithdrawn: r.amount_withdrawn,
  backendOrderId: r.order_id,
  backendOrderState: r.order_state,
  receiveTxId: r.txId,
})

export const postFixedPriceSwap = (
  sendAmount: number,
  sendSymbol: string,
  receiveAddress: string,
  receiveSymbol: string,
  refundAddress: string,
  userId: string,
): Promise<SwapOrder> => fetchPost(`${apiUrl}/api/v2/public/swap`, {
  user_id: userId,
  deposit_amount: sendAmount,
  deposit_currency: sendSymbol,
  withdrawal_address: receiveAddress,
  withdrawal_currency: receiveSymbol,
  refund_address: refundAddress,
}).then((r) => log.debugInline('postFixedPriceSwap', r))
  .then(formatOrderResult)
  .catch((err) => {
    log.error(err)
    const errMsg = filterErrors(err)
    throw new Error(errMsg)
  })

export const fetchOrderStatus = (swapOrderId: string) => fetchGet(`${apiUrl}/api/v1/public/txStat/${swapOrderId}`)
  .then((result) => log.debugInline('fetchOrderStatus', result))
  .catch((err) => {
    log.error(err)
    const errMsg = filterErrors(err)
    throw new Error(errMsg)
  })

export const fetchOrders = (
  walletId: string,
  page: number = 1,
  limit: number = 20,
): Promise<SwapOrder[]> =>
  Promise.all([
    fetchGet(`${apiUrl}/api/v2/public/swaps`, {
      user_id: walletId,
      page,
      limit,
    }).then((r) => log.debugInline(`fetchOrders?user_id=${walletId}`, r)),
    fetchGet(`${apiUrl}/api/v2/public/swaps`, {
      withdrawal_address: walletId,
      page,
      limit,
    }).then((r) => log.debugInline(`fetchOrders?withdrawal_address=${walletId}`, r)),
  ]).then(([r1, r2]) => r1.orders.concat(r2.orders).map(formatOrderResult))
    .catch((e) => {
      log.error(e)
      throw e
    })

export default {
  fetchAssets,
  fetchAssetPrice,
  fetchAssetPrices,
  fetchPriceChart,
  fetchMarketInfo,
  postFixedPriceSwap,
  fetchOrderStatus,
  fetchOrders,
  fetchSwap,
}

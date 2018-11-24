import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { filterErrors } from 'Utilities/helpers'
import { toBigNumber } from 'Utilities/convert'
import log from 'Log'
import config from 'Config'

import { Asset, SwapOrder } from 'Types'

const { siteUrl, apiUrl } = config

export function fetchAssets(): Promise<Asset[]> {
  return fetchGet(`${apiUrl}/api/v2/public/currencies`, null, { retries: 2 })
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

export const fetchAssetPrices = () => fetchGet(`${siteUrl}/app/portfolio-price`, null, { retries: 2 })

export const fetchPriceChart = (symbol: string) => fetchGet(`${siteUrl}/app/portfolio-chart/${symbol}`)

export const fetchPairData = (pair: string) => fetchGet(`${apiUrl}/api/v2/public/price/${pair}`)

export const fetchRestrictionsByIp = () => fetchGet(`${apiUrl}/api/v2/public/geoinfo`)

const formatOrderResult = (r: any): SwapOrder => ({
  orderId: r.swap_id,
  orderStatus: r.status,
  createdAt: r.created_at ? new Date(r.created_at) : null,
  updatedAt: r.updated_at ? new Date(r.updated_at) : null,
  depositAddress: r.deposit_address,
  sendWalletId: r.user_id,
  depositAmount: r.deposit_amount ? toBigNumber(r.deposit_amount) : null,
  sendSymbol: r.deposit_currency,
  receiveAddress: r.withdrawal_address,
  receiveAmount: r.withdrawal_amount ? toBigNumber(r.withdrawal_amount) : null,
  receiveSymbol: r.withdrawal_currency,
  refundAddress: r.refund_address,
  spotRate: r.spot_price ? toBigNumber(r.spot_price) : null,
  rate: r.price ? toBigNumber(r.price) : null,
  rateLockedAt: r.price_locked_at ? new Date(r.price_locked_at) : null,
  rateLockedUntil: r.price_locked_until ? new Date(r.price_locked_until) : null,
  amountDeposited: r.amount_deposited ? toBigNumber(r.amount_deposited) : null,
  amountWithdrawn: r.amount_withdrawn ? toBigNumber(r.amount_withdrawn) : null,
  backendOrderId: r.order_id,
  backendOrderState: r.order_state,
  receiveTxId: r.txId,
})

export const fetchSwap = (swapId: string): Promise<SwapOrder> => {
  return fetchGet(`${apiUrl}/api/v2/public/swaps/${swapId}`, null, { allowConcurrent: false })
    .then(formatOrderResult)
    .catch((e: any) => {
      log.error(e)
      throw e
    })
}

export const refreshSwap = (id: string) =>
  fetchPost(`${apiUrl}/api/v2/public/swaps/${id}/refresh`)
    .then(formatOrderResult)

export const createNewOrder = ({
  sendSymbol,
  receiveSymbol,
  receiveAddress,
  refundAddress,
  sendAmount,
  userId,
}: {
  sendSymbol: string,
  receiveSymbol: string,
  receiveAddress: string,
  refundAddress?: string,
  sendAmount?: number,
  userId?: string,
}): Promise<SwapOrder> => fetchPost(`${apiUrl}/api/v2/public/swap`, {
  user_id: userId,
  deposit_amount: sendAmount,
  deposit_currency: sendSymbol,
  withdrawal_address: receiveAddress,
  withdrawal_currency: receiveSymbol,
  refund_address: refundAddress,
  ...config.affiliateSettings,
}).then(formatOrderResult)
  .catch((e: any) => {
    log.error(e)
    const errMsg = filterErrors(e)
    throw new Error(errMsg)
  })

type OrdersResult = {
  page: number,
  limit: number,
  total: number,
  orders: object[],
}

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
    }),
    fetchGet(`${apiUrl}/api/v2/public/swaps`, {
      withdrawal_address: walletId,
      page,
      limit,
    }),
  ]).then(([r1, r2]: OrdersResult[]) => r1.orders.concat(r2.orders).map(formatOrderResult))
    .catch((e: any) => {
      log.error(e)
      throw e
    })

export const provideSwapDepositTx = (
  swapOrderId: string,
  swapTxHash: string,
): Promise<SwapOrder> => fetchPost(`${apiUrl}/api/v2/public/swaps/${swapOrderId}/deposit`, {
  tx_id: swapTxHash,
}).then(formatOrderResult)
  .catch((e: any) => {
    log.error(e)
    throw e
  })

export default {
  fetchAssets,
  fetchAssetPrice,
  fetchAssetPrices,
  fetchPriceChart,
  createNewOrder,
  fetchOrders,
  fetchSwap,
  fetchPairData,
  refreshSwap,
  provideSwapDepositTx,
  fetchRestrictionsByIp,
}

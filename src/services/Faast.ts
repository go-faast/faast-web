import { fetchGet, fetchPost, fetchDelete } from 'Utilities/fetch'
import { filterErrors } from 'Utilities/helpers'
import { toBigNumber } from 'Utilities/convert'
import { sessionStorageGet } from 'Utilities/storage'
import log from 'Log'
import config from 'Config'
import crypto from 'crypto'
import { version as appVersion } from 'Pkg'
import getCfp from 'Utilities/cfp'

import { Asset, SwapOrder } from 'Types'

const { apiUrl, affiliateSettings } = config

const getAffiliateSettings = () => {
  const affiliateId = sessionStorageGet('affiliateId')
  const affiliateMargin = sessionStorageGet('affiliateMargin')
  return {
    ...affiliateSettings,
    affiliate_margin: typeof affiliateMargin === 'number' ? affiliateMargin : affiliateSettings.affiliate_margin,
    affiliate_id: typeof affiliateId === 'string' ? affiliateId : affiliateSettings.affiliate_id,
  }
}

export const postFeedback = (type: string, answer: string, email: string,
                             asset: string, assetInfo: string, hash: string ) => {
  // tslint:disable-next-line:max-line-length
  return fetchGet('https://docs.google.com/forms/d/e/1FAIpQLSc5j0rBhIfuPvsbzeEQiwUM2G1J2NvfA_ApcrVy5UqcQDlThA/formResponse', {
    'entry.101588574': email,
    'entry.1830217432': type,
    'entry.324271904': answer,
    'entry.63341380': asset,
    'entry.2126867763': assetInfo,
    'entry.343219407': hash,
  }, {
    headers: {
      accept: 'application/json',
    },
  }).then((r) => r)
  .catch((e) => e)
}

export const getFastGasPrice = (): Promise<number> => {
return fetchGet('https://ethgasstation.info/json/ethgasAPI.json')
  .then((r) => {
    // gas station returns values as multiples of 100Mwei
    return r ? toBigNumber(r.fast).times(1e8) : undefined
  })
  .catch((e) => e)
}

export const getInternationalRate = (symbol: string): Promise<number> => {
  return fetchGet(`https://api.bitaccess.co/v1/currency?from=USD&to=${symbol}&q=1`)
    .then((r) => r ? r.rate : toBigNumber(1))
    .catch((e) => e)
  }

export function fetchAssets(): Promise<any[]> {
  return fetchGet(`${apiUrl}/api/v2/public/currencies`, { include: 'marketInfo' }, { retries: 2 })
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
      asset = formatAssetMarketData(asset)
      if (!asset.decimals) {
        asset.decimals = 0
      }
      return asset as any
    }))
}

export const formatAssetMarketData = (r: any): any => {
  r.marketInfo = r.marketInfo ? r.marketInfo : {}
  const { total_supply: totalSupply = null, max_supply: maxSupply = null, num_market_pairs: numMarketPairs = null,
    tags = null, cmc_rank: cmcRank = null, circulating_supply: availableSupply = null, quote = {} } = r.marketInfo
  const { USD = {} } = quote
  const { price = null, volume_24h: volume24h = null, percent_change_1h: percentChange1h = null,
     percent_change_24h: percentChange24h = null, percent_change_7d: percentChange7d = null,
     market_cap: marketCap = null } = USD
  return ({
    name: r.name,
    symbol: r.symbol,
    walletUrl: r.walletUrl,
    deposit: r.deposit,
    ERC20: r.ERC20 ? r.ERC20 : null,
    receive: r.receive,
    infoUrl: r.infoUrl,
    decimals: r.decimals,
    cmcID: r.cmcID,
    cmcIDno: r.cmcIDno,
    restricted: r.restricted,
    availableSupply,
    confirmations: r.confirmations,
    iconUrl: r.iconUrl,
    contractAddress: r.contractAddress,
    terms: r.terms,
    price,
    volume24h,
    percentChange1h,
    percentChange24h,
    percentChange7d,
    marketCap,
    totalSupply,
    maxSupply,
    numMarketPairs,
    tags,
    cmcRank,
  })
}

export const fetchPriceChart = (cmcIDno: number) => {
  const cmcID = cmcIDno.toString()
  return fetchGet(`${apiUrl}/api/v1/data/cmc/price/${cmcID}`, { dataset: 'historical' })
}

export const fetchPairData = (pair: string, depositAmount?: string, withdrawalAmount?: string) =>
  fetchGet(`${apiUrl}/api/v2/public/price/${pair}`, {
    affiliate_margin: getAffiliateSettings().affiliate_margin,
    affiliate_fixed_fee: getAffiliateSettings().affiliate_fixed_fee,
    deposit_amount: depositAmount,
    withdrawal_amount: withdrawalAmount,
})

export const fetchRestrictionsByIp = () => fetchGet(`${apiUrl}/api/v2/public/geoinfo`)

export const formatOrderResult = (r: any): SwapOrder => ({
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
  withdrawalAddressExtraId: r.withdrawal_address_extra_id,
  refundAddressExtraId: r.refund_address_extra_id,
  receiveTxId: r.transaction_id,
  txId: r.deposit_tx_id,
  depositAddressExtraId: r.deposit_address_extra_id,
  marketMakerName: r.maker_name,
})

export const fetchSwap = (swapId: string, formatOrder = true): Promise<SwapOrder> => {
  return fetchGet(`${apiUrl}/api/v2/public/swaps/${swapId}`, null, { allowConcurrent: false })
    .then((swap) => formatOrder ? formatOrderResult(swap) : swap)
    .catch((e: any) => {
      log.error(e)
      throw e
    })
}

export const refreshSwap = (id: string) =>
  fetchPost(`${apiUrl}/api/v2/public/swaps/${id}/refresh`)
    .then(formatOrderResult)

export const validateAddress = (address: string, symbol: string, extraId?: string) => {
  return fetchPost(`${apiUrl}/api/v2/public/address`, {
    address,
    currency: symbol,
    extra_id: extraId,
  })
    .then(({ valid, standardized, message }) => ({ valid, standardized, message }))
    .catch((e: any) => {
      log.error(e)
      throw(e)
    })
}

export type CreateNewOrderParams = {
  sendSymbol: string,
  receiveSymbol: string,
  receiveAddress: string,
  refundAddress?: string,
  sendAmount?: number,
  receiveAddressExtraId?: string,
  refundAddressExtraId?: string,
  userId?: string,
  withdrawalAmount?: number,
  meta?: {
    sendWalletType?: string, // sending wallet type
    receiveWalletType?: string, // receiving wallet type
    appVersion?: string, // defaults to package.json version
    path?: string, // defaults to window.location.pathname
    cfp?: string,
  },
}

export const createNewOrder = async ({
  sendSymbol,
  receiveSymbol,
  receiveAddress,
  receiveAddressExtraId,
  refundAddressExtraId,
  refundAddress,
  sendAmount,
  withdrawalAmount,
  userId,
  meta = {},
}: CreateNewOrderParams): Promise<SwapOrder> => {
  return fetchPost(`${apiUrl}/api/v2/public/swap`, {
  user_id: userId,
  deposit_amount: sendAmount,
  deposit_currency: sendSymbol,
  withdrawal_address: receiveAddress,
  withdrawal_currency: receiveSymbol,
  withdrawal_amount: withdrawalAmount,
  withdrawal_address_extra_id: receiveAddressExtraId,
  refund_address_extra_id: refundAddressExtraId,
  refund_address: refundAddress,
  ...getAffiliateSettings(),
  meta: {
    appVersion,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
    cfp: await getCfp(),
    ...meta,
  },
}).then(formatOrderResult)
  .catch((e: any) => {
    log.error(e)
    const errMsg = filterErrors(e)
    throw new Error(errMsg)
  })
}

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
  formatOrder = true,
): Promise<SwapOrder[]> | Promise<any[]> =>
  Promise.all([
    fetchGet(`${apiUrl}/api/v2/public/swaps`, {
      any_address: walletId,
      page,
      limit,
    }),
  ]).then(([r1]: OrdersResult[]) =>
    r1.orders.map((order: OrdersResult) => (
    formatOrder ? formatOrderResult(order) : order
    )))
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

export const getAffiliateStats = (
  id: string,
  key: string,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/stats`, null, {
  headers: {
    'affiliate-id': id,
    nonce,
    signature,
  },
}).then((stats) => stats)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const getAffiliateSwapPayouts = (
  id: string,
  key: string,
  page: number = 1,
  limit: number = 20,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/withdrawals`,
  { limit, page }, {
  headers: {
    'affiliate-id': id,
    nonce,
    signature,
  },
}).then((swaps) => swaps)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const getAffiliateBalance = (
  id: string,
  key: string,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/balance`,
  undefined, {
  headers: {
    'affiliate-id': id,
    nonce,
    signature,
  },
}).then((balance) => balance)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const getAffiliateAccount = (
  id: string,
  key: string,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/account`,
  null, {
  headers: {
    'affiliate-id': id,
    nonce,
    signature,
  },
}).then((account) => account)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const getAffiliateExportLink = (
  id: string,
  key: string,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/swaps/export`,
  null, {
  headers: {
    'affiliate-id': id,
    nonce,
    signature,
  },
}).then((result) => result)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const initiateAffiliateWithdrawal = (
  withdrawalAddress: string,
  id: string,
  key: string,
): Promise<void> => {
  const requestJSON = {
    withdrawal_address: withdrawalAddress,
  }
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(JSON.stringify(requestJSON), key, nonce)
  return fetchPost(`${apiUrl}/api/v2/public/affiliate/withdraw`, requestJSON,
  undefined,
{ headers: {
  'affiliate-id': id,
  nonce,
  signature,
  },
})
  .then((r) => r)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const affiliateRegister = (
  id: string,
  address: string,
  email: string,
): Promise<void> => {
  return fetchPost(`${apiUrl}/api/v2/public/affiliate/register`, {
    affiliate_id: id,
    affiliate_payment_address: address,
    contact_email: email,
  })
  .then((res) => res)
  .catch((e: any) => {
    log.error(e)
    throw e
  })
}

export const getAffiliateSwaps = (
  id: string,
  key: string,
  page: number = 1,
  limit: number = 50,
): Promise<void> => {
  const nonce = String(Date.now())
  const signature = createAffiliateSignature(undefined, key, nonce)
  return fetchGet(`${apiUrl}/api/v2/public/affiliate/swaps`,
  { limit, page },
  {
    headers: {
      'affiliate-id': id,
      nonce,
      signature,
    },
  })
  .then((swaps) => swaps)
  .catch((e: any) => {
    log.error(e)
    return e
  })
}

export const createAffiliateSignature = (requestJSON: string | boolean, secret: string, nonce: string) => {
  const updateString = requestJSON ? nonce + requestJSON : nonce
  return crypto
    .createHmac('sha256', secret)
    .update(updateString, 'utf8')
    .digest('hex')
}

export default {
  fetchAssets,
  fetchPriceChart,
  createNewOrder,
  fetchOrders,
  fetchSwap,
  fetchPairData,
  refreshSwap,
  provideSwapDepositTx,
  fetchRestrictionsByIp,
  getAffiliateStats,
  getAffiliateSwapPayouts,
  initiateAffiliateWithdrawal,
  getAffiliateExportLink,
  affiliateRegister,
  getAffiliateBalance,
  getAffiliateAccount,
  getAffiliateSwaps,
  formatOrderResult,
  validateAddress,
  getInternationalRate,
}

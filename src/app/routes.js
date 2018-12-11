import urlJoin from 'url-join'
import { isString, ary } from 'lodash'
import qs from 'query-string'

import log from 'Utilities/log'

const createPath = (...paths) => {
  const fullPath = paths
    .map((path) => path && path.path ? path.path : path)
    .filter(isString)
    .reduce(ary(urlJoin, 2))
  const pathParamNames = fullPath
    .split('/')
    .filter((token) => token.startsWith(':'))
    .map((token) => token.slice(1))

  log.debug(`Created path ${fullPath}`)

  const subPathParams = (...params) => {
    let substitutedPath = fullPath
    pathParamNames.forEach((paramName, i) => {
      const paramValue = params[i]
      if (paramValue) {
        substitutedPath = substitutedPath.replace(`:${paramName}`, paramValue)
      }
    })
    const queryParams = params[pathParamNames.length]
    let query = ''
    if (typeof queryParams === 'object' && queryParams !== null) {
      query = '?' + qs.stringify(queryParams)
    }
    return substitutedPath + query
  }
  subPathParams.path = fullPath
  return subPathParams
}

export const root = createPath('/')

const portfolio = createPath('/portfolio')
export const dashboard = portfolio
export const rebalance = createPath(portfolio, '/rebalance')
export const rebalanceInstructions = createPath(rebalance, '/instructions')
export const tradeHistory = createPath(portfolio, '/orders')

export const tradeDetail = createPath('/orders/:tradeId')
export const swapWidget = createPath('/swap')
export const viewOnlyAddress = createPath('/address/:addressQuery')

const assets = createPath('/assets')
export const assetIndex = assets
export const watchlist = createPath(assets, '/watchlist')
export const trending = createPath(assets, '/trending')
export const assetDetail = createPath(assets, '/:symbol')

export const connect = createPath('/portfolio/connect')
export const connectHwWallet = createPath(connect, '/hw/:walletType')
export const walletInfoModal = createPath(connect, '/:walletType')
export const connectHwWalletAsset = createPath(connectHwWallet, '/:assetSymbol')
export const connectHwWalletAssetConfirm = createPath(connectHwWalletAsset, '/confirm')
export const connectHwWalletAssetAccounts = createPath(connectHwWalletAsset, '/accounts')

export default {
  root,
  dashboard,
  rebalance,
  rebalanceInstructions,
  tradeHistory,
  tradeDetail,
  swapWidget,
  assetDetail,
  connect,
  connectHwWallet,
  connectHwWalletAsset,
  connectHwWalletAssetConfirm,
  connectHwWalletAssetAccounts,
  viewOnlyAddress,
  assetIndex,
  watchlist,
  trending,
  walletInfoModal
}

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
export const dashboard = createPath('/dashboard')
export const settings = createPath('/settings')
export const rebalance = createPath('/rebalance')
export const rebalanceInstructions = createPath(rebalance, '/instructions')
export const viewOnlyAddress = createPath('/address/:addressQuery')
export const tradeHistory = createPath('/orders')
export const walletDepositModal = createPath('/wallets/:symbol/receive/:walletId')
export const walletWithdrawalModal = createPath('/wallets/:symbol/send/:walletId')
export const wallets = createPath('/wallets/:symbol?')
export const tradeWidgetDetail = createPath('/orders/widget/:tradeId')
export const tradeDetail = createPath('/orders/:tradeId')
export const swapWidgetStepTwo = createPath('/swap/send')
export const swapWidget = createPath('/swap')
export const watchlist = createPath('/assets/watchlist')
export const assetNews = createPath('/assets/news')
export const trending = createPath('/assets/trending/:timeFrame?')
export const assetDetail = createPath('/assets/:symbol')
export const assetIndex = createPath('/assets')

export const affiliateLogin = createPath('/affiliates/login')
export const affiliateAcceptTerms = createPath('/affiliates/terms/accept')
export const affiliateSignup = createPath('/affiliates/signup')
export const affiliateAccountModal = createPath('/affiliates/dashboard/account')
export const affiliateDashboard = createPath('/affiliates/dashboard')
export const affiliateSettings = createPath('/affiliates/settings')
export const affiliateSwaps = createPath('/affiliates/swaps')
export const affiliatePayouts = createPath('/affiliates/withdrawals')
export const affiliateTerms = createPath('/affiliates/terms')

export const makerLogin = createPath('/makers/login')
export const makerRegister = createPath('/makers/register')
export const makerRegisterProfile = createPath('/makers/register/profile')
export const makerLoading = createPath('/makers/login/loading')
export const makerLoginCallback = createPath('/makers/login/callback')
export const makerAccountModal = createPath('/makers/dashboard/account')
export const capacityDepositModal = createPath('/makers/dashboard/capacity')
export const makerSetup = createPath('/makers/setup/server')
export const makerExchangeSetup = createPath('/makers/setup/exchanges')
export const makerBalanceSetup = createPath('/makers/setup/balances')
export const makerDashboard = createPath('/makers/dashboard')
export const makerSwaps = createPath('/makers/swaps')
export const makerBalances = createPath('/makers/balances')
export const makerSettings = createPath('/makers/settings')
export const makerNotifications = createPath('/makers/notifications')
export const makerRetractCapacityModal = createPath('/makers/settings/retract')

export const connectMobileWallet = createPath(connect, '/mobile/connect/:walletType')
export const connect = createPath('/connect')
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
  swapWidgetStepTwo,
  tradeWidgetDetail,
  assetDetail,
  connect,
  connectHwWallet,
  connectHwWalletAsset,
  connectHwWalletAssetConfirm,
  connectHwWalletAssetAccounts,
  viewOnlyAddress,
  assetIndex,
  assetNews,
  walletInfoModal,
  affiliateLogin,
  affiliateSignup,
  affiliateDashboard,
  affiliateSettings,
  affiliateSwaps,
  affiliatePayouts,
  affiliateAccountModal,
  affiliateTerms,
  watchlist,
  trending,
  settings,
  affiliateAcceptTerms,
  wallets,
  walletDepositModal,
  walletWithdrawalModal,
  makerLogin,
  makerDashboard,
  makerSwaps,
  makerBalances,
  makerSettings,
  makerLoading,
  makerRegister,
  makerBalanceSetup,
  capacityDepositModal,
  makerRetractCapacityModal,
  makerNotifications
}

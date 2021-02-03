import { mapValues } from 'lodash'
import { createSelector } from 'reselect'
import { toBigNumber } from 'Utilities/numbers'
import { createItemSelector, selectItemId } from 'Utilities/selector'
import { getAllAssets } from './asset'
import { getAllWallets } from './wallet'
import { getAllTxs } from './tx'
import { createSwapExtender } from './swap'

const getMakerState = ({ maker }) => maker

// Maker selectors
export const isMakerLoggedIn = createSelector(getMakerState, ({ loggedIn }) => loggedIn)
export const hasLoginError = createSelector(getMakerState, ({ loginError }) => loginError)
export const isLoadingData = createSelector(getMakerState, ({ loadingData }) => loadingData)
export const isMakerDataStale = createSelector(getMakerState, makerState => {
  const { lastUpdated } = makerState
  return (Date.now() - lastUpdated) >= 300000
})
export const areSwapsLoading = createSelector(getMakerState, ({ swapsLoading }) => swapsLoading)
export const makerStats = createSelector(getMakerState, ({ stats }) => stats)
export const makerSwaps = createSelector(
  getMakerState,
  getAllAssets,
  getAllWallets,
  getAllTxs,
  ({ swaps }, allAssets, allWallets, allTxs) => mapValues(swaps, createSwapExtender(allAssets, allWallets, allTxs)))

export const makerSwapsArray = createSelector(makerSwaps, Object.values)
export const getMakerBalances = createSelector(getMakerState, ({ balances, profile: { exchangeDepositAddresses } }) => { 
  balances.forEach(balance => {
    balance.exchangeAddress = exchangeDepositAddresses && exchangeDepositAddresses[balance.asset] && exchangeDepositAddresses[balance.asset].address
  })
  return balances
})
export const getBalanceBySymbol = createItemSelector(getMakerBalances, selectItemId, (balances, symbol) => {
  const balanceObj = balances.find(b => b.asset == symbol) || {}
  return balanceObj
})
export const getTotalBalanceBySymbol = createItemSelector(getMakerBalances, selectItemId, (balances, symbol) => {
  const balanceObj = balances.find(b => b.asset == symbol) || {}
  const balance = toBigNumber(balanceObj.exchange).plus(toBigNumber(balanceObj.wallet))
  return balance
})
export const getMakerProfile = createSelector(getMakerState, ({ profile }) => profile || {})
export const getTotalBalanceBTC = createSelector(getMakerProfile, (profile) => { 
  const approxBTC = profile.approxTotalBalances && profile.approxTotalBalances.total.BTC || 0
  const feesOwed = profile.feesOwed || 0
  const capacityBalanceBtc = profile.capacityAvailableBtc || 0
  return (parseFloat(approxBTC) + parseFloat(capacityBalanceBtc)) - parseFloat(feesOwed)
})
export const getCapacityAddress = createSelector(getMakerProfile, ({ capacityAddress }) => capacityAddress)
export const getCapacityBalance = createSelector(getMakerProfile, ({ capacityMaximumBtc }) => capacityMaximumBtc)
export const isMakerDisabled = createSelector(getMakerProfile, ({ isDisabled }) => isDisabled)
export const makerLastDisabledAt = createSelector(getMakerProfile, ({ lastDisabledAt }) => lastDisabledAt)
export const makerBalanceTargets = createSelector(getMakerProfile, ({ balanceTargets }) => balanceTargets)
export const getMakerWarnings = createSelector(getMakerProfile, ({ warnings }) => warnings)
export const getMakerWarningsCount = createSelector(getMakerWarnings, (warnings) => warnings && warnings.length)
export const getBalanceAlerts = createSelector(getMakerProfile, getMakerBalances, ({ balanceTargets, detailedStatus }, balances) => {
  if (!balanceTargets) return []
  const wallets = detailedStatus && detailedStatus.balances && detailedStatus.balances.wallet
  if (!wallets) return []
  const alerts = balances ? balances.map(({ asset, exchange, wallet }) => {
    const totalBalance = toBigNumber(exchange).plus(toBigNumber(wallet))
    const minBalance = balanceTargets[asset].totalBalanceMinimum
    const balanceTarget = toBigNumber(minBalance)
    if (totalBalance.lt(balanceTarget)) {
      return ({
        symbol: asset,
        alert: `Minimum ${asset} balance must be at least ${minBalance} ${asset}`,
        target: balanceTarget,
        address: wallets[asset] ? wallets[asset].address : ''
      })
    }
  }) : []
  return alerts.filter(x => x)
})
export const getBalanceAlertByAddress = createItemSelector(getBalanceAlerts, selectItemId, (alerts, address) => {
  const alert = alerts.find(alert => alert.address == address)
  return alert
})
export const getMakerBalanceAlertsCount = createSelector(getBalanceAlerts, (alerts) => alerts && alerts.length)
export const getNotificationCount = createSelector(getMakerWarningsCount, getMakerBalanceAlertsCount, (warnings = 0, alerts = 0) => warnings + alerts)
export const isAbleToRetractCapacity = createSelector(getCapacityBalance, isMakerDisabled, makerLastDisabledAt, (capacityBalance, isDisabled, lastDisabledAt) => {
  return capacityBalance && parseFloat(capacityBalance) > 0 && isDisabled && (Date.now() - lastDisabledAt.getTime()) > 259200000
})
export const getMakerSecret = createSelector(getMakerProfile, ({ llamaSecret }) => llamaSecret)
export const isMakerSuspended = createSelector(getMakerProfile, ({ isSuspended }) => isSuspended)
export const isMakerOnline = createSelector(getMakerProfile, ({ isOnline }) => isOnline)
export const getMakerStats = createSelector(getMakerState, ({ stats }) => stats)
export const getMakerProfitUSD = createSelector(getMakerStats, (stats) => {
  if (stats && !isNaN(stats.expenses)) {
    const profit = stats.revenue && stats.revenue.maker_rewards_usd - stats.expenses.total_usd
    return profit
  } else {
    return 0
  }
})
export const getMakerProfitBTC = createSelector(getMakerStats, (stats) => {
  if (stats && stats.expenses) {
    const profit = stats.revenue && stats.revenue.maker_rewards_btc - stats.expenses.total_btc
    return profit
  } else {
    return 0
  }
})
export const makerId = createSelector(getMakerProfile, ({ makerId }) => makerId)
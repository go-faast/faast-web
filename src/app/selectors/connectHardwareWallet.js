import { createSelector, currySelector } from 'Utilities/selector'

import { getAsset } from 'Selectors'

export const getBaseState = ({ connectHardwareWallet }) => connectHardwareWallet

export const getWalletType = createSelector(getBaseState, ({ walletType }) => walletType)
export const getAssetSymbol = createSelector(getBaseState, ({ assetSymbol }) => assetSymbol)
export const getStatus = createSelector(getBaseState, ({ status }) => status)
export const getConnectBatchQueue = createSelector(getBaseState, ({ connectBatchQueue }) => connectBatchQueue)
export const getConnectedAccountIds = createSelector(getBaseState, ({ connectedAccountIds }) => connectedAccountIds)
export const getDerivationPath = createSelector(getBaseState, ({ derivationPath }) => derivationPath)
export const getConnectTimeoutId = createSelector(getBaseState, ({ connectTimeoutId }) => connectTimeoutId)
export const getRetryTimerId = createSelector(getBaseState, ({ retryTimerId }) => retryTimerId)
export const getRetryTimerSeconds = createSelector(getBaseState, ({ retryTimerSeconds }) => retryTimerSeconds)
export const getAccountRetriever = createSelector(getBaseState, ({ accountRetriever }) => accountRetriever)
export const isAccountSelectEnabled = createSelector(getBaseState, ({ accountSelectEnabled }) => accountSelectEnabled)
export const getSelectedPageIndex = createSelector(getBaseState, ({ selectedPageIndex }) => selectedPageIndex)
export const getSelectedAccountIndex = createSelector(getBaseState, ({ selectedAccountIndex }) => selectedAccountIndex)
export const getAccounts = createSelector(getBaseState, ({ accounts }) => accounts.map((a, i) => ({ index: i, ...a })))
export const getAccountPageSize = createSelector(getBaseState, ({ accountPageSize }) => accountPageSize)

export const isStatusReset = createSelector(getStatus, (status) => !status)

export const isStatusConnected = createSelector(getStatus, (status) => status === 'connected')

export const getConnectingAsset = currySelector(getAsset, getAssetSymbol)

export const getConnectedAccountSymbols = createSelector(
  getConnectedAccountIds,
  (connectedAccountIds) => Object.keys(connectedAccountIds)
)

export const getAccountPageStartIndex = createSelector(
  getSelectedPageIndex,
  getAccountPageSize,
  (pageIndex, pageSize) => pageIndex * pageSize)

export const getAccountPageEndIndex = createSelector(
  getSelectedPageIndex,
  getAccountPageSize,
  (pageIndex, pageSize) => (pageIndex + 1) * pageSize - 1)

export const getSelectedPageAccounts = createSelector(
  getAccounts,
  getAccountPageStartIndex,
  getAccountPageEndIndex,
  (accounts, startIndex, endIndex) => {
    const pageAccounts = []
    for (let i = startIndex; i <= endIndex; i++) {
      pageAccounts.push(accounts[i] || { index: i })
    }
    return pageAccounts
  })

export const getSelectedAccount = createSelector(
  getSelectedAccountIndex,
  getAccounts,
  (index, accounts) => accounts[index] || { index })

export const isConfirmSelectedAccountDisabled = createSelector(
  getSelectedAccount,
  (account) => !(account && account.label)
)

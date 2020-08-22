import { createSelector } from 'reselect'
import { createItemSelector, selectItemId } from 'Utilities/selector'

export const getWithdrawalState = ({ withdrawal }) => withdrawal

// Withdrawal selectors
export const getWithdrawals = createSelector(getWithdrawalState, (withdrawals) => withdrawals)
export const getWithdrawalsArray = createSelector(getWithdrawals, (withdrawals) => Object.values(withdrawals))
export const getSentWithdrawals = createSelector(getWithdrawalsArray, (withdrawals) => withdrawals.filter(w => w.sent))
export const getSentWithdrawalsByAsset = createItemSelector(getSentWithdrawals, selectItemId, 
  (withdrawals, symbol) => withdrawals.filter(w => w.assetSymbol == symbol))


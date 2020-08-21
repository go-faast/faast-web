import { createReducer } from 'redux-act'
import {
  updateWithdrawal, restoreWithdrawals, addWithdrawal
} from 'Actions/withdrawal'
import { createUpserter, createUpdater } from 'Utilities/helpers'

export const initialState = {
}
export const withdrawalInitialState = {
  id: '',
  tx: {},
  to: '',
  amount: undefined,
  assetSymbol: '',
  hash: '',
  sent: false,
  walletId: '',
  sentAt: undefined,
  createdAt: undefined,
}

const upsert = createUpserter('id', withdrawalInitialState)
const update = createUpdater('id')

export const reducerFunctions = {
  [addWithdrawal]: (state, data) => {
    return upsert(state, {
      ...data
    })
  },
  [updateWithdrawal]: (state, data) => update(state, { ...data }),
  [restoreWithdrawals]: (state, restoredState) => ({
    ...state,
    ...restoredState
  })
}

export default createReducer(reducerFunctions, initialState)
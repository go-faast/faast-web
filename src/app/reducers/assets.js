import { createReducer } from 'redux-act'
import { setAssets } from 'Actions/redux'
import { createMergeByField } from 'Utilities/helpers'

const initialState = {}

const mergeBySymbol = createMergeByField('symbol')

export default createReducer({
  [setAssets]: (state, assetsArray) => mergeBySymbol(state, ...assetsArray)
}, initialState)

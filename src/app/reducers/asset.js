import { createReducer } from 'redux-act'
import {
  initialState as commonInitialState,
  reducerFunctions as commonReducerFunctions
} from 'Common/reducers/asset'

const initialState = {
  ...commonInitialState,
}

export default createReducer({
  ...commonReducerFunctions,
}, initialState)

import { createReducer } from 'redux-act'
import {
  initialState as commonInitialState,
  reducerFunctions as commonReducerFunctions
} from 'Common/reducers/rate'

const initialState = {
  ...commonInitialState,
}

export default createReducer({
  ...commonReducerFunctions,
}, initialState)

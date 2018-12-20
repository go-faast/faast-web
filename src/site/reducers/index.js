import { combineReducers } from 'redux'

import asset from 'Common/reducers/asset'
import app from 'Common/reducers/app'

const reducer = combineReducers({
  asset,
  app
})

export default reducer

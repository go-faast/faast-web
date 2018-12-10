import { combineReducers } from 'redux'

import asset from 'Shared/reducers/asset'
import app from 'Shared/reducers/app'

const reducer = combineReducers({
  asset,
  app
})

export default reducer
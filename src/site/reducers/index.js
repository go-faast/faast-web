import { combineReducers } from 'redux'

import asset from 'Common/reducers/asset'
import app from 'Common/reducers/app'
import { reducer as formReducer } from 'redux-form'

const reducer = combineReducers({
  asset,
  app,
  form: formReducer,
})

export default reducer

import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import { routerReducer } from 'react-router-redux'
import asset from './asset'
import swap from './swap'
import orderModal from './orderModal'
import settings from './settings'
import portfolio from './portfolio'
import wallet from './wallet'
import app from './app'
import accountSearch from './accountSearch'

export default combineReducers({
  app,
  accountSearch,
  portfolio,
  wallet,
  asset,
  swap,
  orderModal,
  settings,
  form: formReducer,
  toastr: toastrReducer,
  router: routerReducer
})

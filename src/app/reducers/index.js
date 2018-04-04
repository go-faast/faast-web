import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import { routerReducer } from 'react-router-redux'
import assets from './assets'
import swap from './swap'
import orderModal from './orderModal'
import settings from './settings'
import mediaQueries from './mediaQueries'
import portfolio from './portfolio'
import wallets from './wallets'
import app from './app'
import accountSearch from './accountSearch'

export default combineReducers({
  app,
  accountSearch,
  portfolio,
  wallets,
  assets,
  swap,
  orderModal,
  settings,
  form: formReducer,
  toastr: toastrReducer,
  mediaQueries,
  router: routerReducer
})

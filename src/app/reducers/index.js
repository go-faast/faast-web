import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import assets from './assets'
import swap from './swap'
import mock from './mock'
import orderModal from './orderModal'
import settings from './settings'
import mediaQueries from './mediaQueries'
import portfolio from './portfolio'
import wallets from './wallets'
import app from './app'

export default combineReducers({
  app,
  portfolio,
  wallets,
  assets,
  swap,
  mock,
  orderModal,
  settings,
  form: formReducer,
  toastr: toastrReducer,
  mediaQueries
})

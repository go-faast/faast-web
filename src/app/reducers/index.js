import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import assets from './assets'
import portfolio from './portfolio'
import portfolios from './portfolios'
import swap from './swap'
import mock from './mock'
import orderModal from './orderModal'
import settings from './settings'
import mediaQueries from './mediaQueries'
import wallets from './wallets'
import app from './app'

export default combineReducers({
  app,
  wallets,
  assets,
  portfolio,
  portfolios,
  swap,
  mock,
  orderModal,
  settings,
  form: formReducer,
  toastr: toastrReducer,
  mediaQueries
})

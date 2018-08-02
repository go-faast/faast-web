import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import { routerReducer } from 'react-router-redux'
import asset from './asset'
import swap from './swap'
import swundle from './swundle'
import orderModal from './orderModal'
import settings from './settings'
import portfolio from './portfolio'
import wallet from './wallet'
import app from './app'
import accountSearch from './accountSearch'
import walletPasswordPrompt from './walletPasswordPrompt'
import connectHardwareWallet from './connectHardwareWallet'
import tx from './tx'

export default combineReducers({
  app,
  accountSearch,
  portfolio,
  wallet,
  asset,
  tx,
  swap,
  swundle,
  orderModal,
  settings,
  walletPasswordPrompt,
  connectHardwareWallet,
  form: formReducer,
  toastr: toastrReducer,
  router: routerReducer
})

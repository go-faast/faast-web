import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { reducer as toastrReducer } from 'react-redux-toastr'
import assets from './assets'
import portfolio from './portfolio'
import wallet from './wallet'
import swap from './swap'
import mock from './mock'
import orderModal from './orderModal'
import settings from './settings'

export default combineReducers({
  wallet,
  assets,
  portfolio,
  swap,
  mock,
  orderModal,
  settings,
  form: formReducer,
  toastr: toastrReducer
})

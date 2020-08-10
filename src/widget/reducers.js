import { combineReducers } from 'redux'
import { reducer as formReducer } from 'redux-form'
import { routerReducer } from 'react-router-redux'
import asset from 'Common/reducers/asset'
import swap from 'Common/reducers/swap'
import orderModal from 'Reducers/orderModal'
import portfolio from 'Reducers/portfolio'
import wallet from 'Reducers/wallet'
import app from 'Reducers/app'
import tx from 'Reducers/tx'
import rate from 'Common/reducers/rate'
import widget from 'Reducers/widget'
import i18n from 'Reducers/i18n'
import affiliate from 'Reducers/affiliate'

export default combineReducers({
  app,
  i18n,
  portfolio,
  affiliate,
  wallet,
  asset,
  rate,
  tx,
  swap,
  widget,
  orderModal,
  form: formReducer,
  router: routerReducer,
})

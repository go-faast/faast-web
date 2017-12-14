/* eslint-disable new-cap */

import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { Provider } from 'react-redux'
import throttle from 'lodash/throttle'
import createHistory from 'history/createHashHistory'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { Route } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import Entry from 'Components/Entry'
import reducers from './reducers'
import { restoreFromAddress, saveToAddress } from 'Utilities/storage'
import { restoreWallet } from 'Utilities/wallet'
import { statusAllSwaps } from 'Utilities/swap'
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/style.scss?nsm'

const persistedState = () => {
  const wallet = restoreWallet()
  const addressState = restoreFromAddress(wallet && wallet.address) || {}
  const status = statusAllSwaps(addressState.swap)
  const swap = (status === 'unavailable' || status === 'unsigned' || status === 'unsent') ? undefined : addressState.swap
  const settings = addressState.settings

  return {
    wallet,
    swap,
    settings
  }
}

const history = createHistory()
const middleware = [
  thunk,
  routerMiddleware(history)
]
if (!window.faast) window.faast = {}
if (window.faast.dev) middleware.push(logger)
window.faast.intervals = {
  orderStatus: [],
  txReceipt: []
}
const store = createStore(reducers, persistedState(), applyMiddleware(...middleware))

store.subscribe(throttle(() => {
  const state = store.getState()
  if (state.wallet) {
    saveToAddress(state.wallet.address, {
      swap: state.swap,
      settings: state.settings
    })
  }
}, 1000))

const Portfolio = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div id='portfolio-page'>
          <Route component={Entry} />
          <ReduxToastr
            timeOut={4000}
            newestOnTop={false}
            preventDuplicates
            position='top-right'
          />
        </div>
      </ConnectedRouter>
    </Provider>
  )
}

export default Portfolio

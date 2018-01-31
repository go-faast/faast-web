/* eslint-disable new-cap */

import React from 'react'
import { createStore, applyMiddleware, compose } from 'redux'
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
import { saveToAddress } from 'Utilities/storage'
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/style.scss?nsm'
import { getCurrentWallet, isAppReady } from 'Selectors'

const history = createHistory()
const middleware = [
  thunk,
  routerMiddleware(history)
]
if (!window.faast) window.faast = {}
if (window.faast.dev && !window.__REDUX_DEVTOOLS_EXTENSION__) middleware.push(logger)
window.faast.intervals = {
  orderStatus: [],
  txReceipt: []
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)))

store.subscribe(throttle(() => {
  const state = store.getState()
  const appReady = isAppReady(state)
  if (appReady) {
    const wallet = getCurrentWallet(state)
    if (wallet) {
      saveToAddress(wallet.id, {
        swap: state.swap,
        settings: state.settings
      })
    }
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

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
import EntryController from 'Controllers/EntryController'
import reducers from './reducers'
import { restoreWallet, restoreSwap, saveSwap } from 'Utilities/storage'
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/style.scss?nsm'

const persistedState = () => {
  const wallet = restoreWallet()
  const swap = restoreSwap(wallet && wallet.address)
  return {
    wallet,
    swap
  }
}

const history = createHistory()
const middleware = [
  thunk,
  routerMiddleware(history)
]
if (!window.faast) window.faast = {}
if (window.faast.dev) middleware.push(logger)
const store = createStore(reducers, persistedState(), applyMiddleware(...middleware))

store.subscribe(throttle(() => {
  const state = store.getState()
  if (state.wallet) saveSwap(state.wallet.address, state.swap)
}, 1000))

const Portfolio = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div id='portfolio-page'>
          <Route component={EntryController} />
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

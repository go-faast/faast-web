/* eslint-disable new-cap */

import React from 'react'
import { createStore, applyMiddleware } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { Provider } from 'react-redux'
import createHistory from 'history/createHashHistory'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import { Route } from 'react-router-dom'
import ReduxToastr from 'react-redux-toastr'
import EntryController from 'Controllers/EntryController'
import reducers from './reducers'
import log from 'Utilities/log'
import config from 'Config'
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/style.scss?nsm'

if (window.Web3) {
  window.faast.web3 = new window.Web3(new window.Web3.providers.HttpProvider(config.web3Provider))
}

if (!('indexedDB' in window)) {
  log.warn('This browser doesn\'t support IndexedDB')
}

const history = createHistory()
const middleware = [
  thunk,
  routerMiddleware(history)
]
if (window.faast && window.faast.dev) middleware.push(logger)
const store = createStore(reducers, applyMiddleware(...middleware))

window.faast.hw = {}
if (window.ledger) {
  window.ledger.comm_u2f.create_async()
  .then((comm) => {
    window.faast.hw.ledger = new window.ledger.eth(comm)
  })
  .fail(log.error)
}
if (window.TrezorConnect) {
  window.faast.hw.trezor = window.TrezorConnect
}

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

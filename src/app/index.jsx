/* eslint-disable new-cap */

import React from 'react'
import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { Provider } from 'react-redux'
import { throttle } from 'lodash'
import { ConnectedRouter, routerMiddleware } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'
import { createHashHistory, createBrowserHistory } from 'history'
import { pickBy } from 'lodash'

import App from 'Components/App'
import reducers from './reducers'
import { localStorageSetJson, localStorageGetJson } from 'Utilities/storage'
import { isAppReady } from 'Selectors'
import config from 'Config'
import { getAssetState, getTxState, getSentSwapOrderTxIds } from 'Selectors'

const { isDev, isIpfs } = config
const createHistory = isIpfs ? createHashHistory : createBrowserHistory

const history = createHistory({ basename: process.env.ROUTER_BASE_NAME })
const middleware = [
  thunk,
  routerMiddleware(history)
]

if (!isIpfs) {
  // Redirect legacy hash routes
  if ((window.location.hash || '').startsWith('#/')) {
    history.replace(window.location.hash.slice(1))
  }
}

if (!window.faast) window.faast = {}
if (isDev && !window.__REDUX_DEVTOOLS_EXTENSION__) middleware.push(logger)
window.faast.intervals = {
  orderStatus: [],
  txReceipt: []
}
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)))

let cachedAssets
let cachedTxs
let cachedSwapTxIds

store.subscribe(throttle(() => {
  const state = store.getState()
  const appReady = isAppReady(state)
  if (appReady) {
    let swapTxIds = getSentSwapOrderTxIds(state)
    if (swapTxIds !== cachedSwapTxIds) {
      const existingSwapTxIds = localStorageGetJson('state:swap-txId')
      if (existingSwapTxIds) {
        swapTxIds = { ...existingSwapTxIds, ...swapTxIds }
      }
      localStorageSetJson('state:swap-txId', swapTxIds)
      cachedSwapTxIds = swapTxIds
    }
    const txState = getTxState(state)
    if (txState !== cachedTxs) {
      const allTxs = pickBy(txState, (tx) => tx.sent)
      localStorageSetJson('state:tx', allTxs)
      cachedTxs = txState
    }
    const assetState = getAssetState(state)
    if (assetState !== cachedAssets) {
      localStorageSetJson('state:asset', assetState)
      cachedAssets = assetState
    }
  }
}, 1000))

const Portfolio = () => {
  return (
    <Provider store={store}>
      <ConnectedRouter history={history}>
        <div>
          <App/>
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

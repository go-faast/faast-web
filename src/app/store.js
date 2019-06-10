import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { throttle } from 'lodash'
import { routerMiddleware } from 'react-router-redux'
import { pickBy } from 'lodash'

import reducers from './reducers'
import { localStorageSetJson, localStorageGetJson } from 'Utilities/storage'
import { isAppReady } from 'Selectors'
import config from 'Config'
import { getAssetState, getTxState, getSentSwapOrderTxIds } from 'Selectors'
import history from './history'
import { googleAnalytics } from './reactGA'

const { isDev } = config

const middleware = [
  thunk,
  routerMiddleware(history),
  googleAnalytics
]

if (isDev && !window.__REDUX_DEVTOOLS_EXTENSION__) middleware.push(logger)
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

export default store

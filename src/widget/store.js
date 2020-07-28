import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'
import { throttle } from 'lodash'

import { isAppReady } from 'Selectors/app'
import { getWidgetState } from 'Selectors/widget'
import { getSwapState } from 'Common/selectors/swap'

import reducers from './reducers'
import config from 'Config'
import { localStorageSetJson } from 'Utilities/storage'

const { isDev } = config

const middleware = [
  thunk,
]

if (isDev && !window.__REDUX_DEVTOOLS_EXTENSION__) middleware.push(logger)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)))

let cachedSwapWidget
let cachedSwaps

store.subscribe(throttle(() => {
  const state = store.getState()
  const appReady = isAppReady(state)
  if (appReady) {
    const swapState = getSwapState(state)
    if (swapState !== cachedSwaps) {
      localStorageSetJson('state:swaps', swapState)
      cachedSwaps = swapState
    }
    const swapWidgetState = getWidgetState(state)
    if (swapWidgetState !== cachedSwapWidget) {
      localStorageSetJson('state:swapWidget', swapWidgetState)
      cachedSwapWidget = swapWidgetState
    }
  }
}, 1000))

export default store

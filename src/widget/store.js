import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import logger from 'redux-logger'

import reducers from './reducers'
import config from 'Config'
import history from './history'

const { isDev } = config

const middleware = [
  thunk,
]

if (isDev && !window.__REDUX_DEVTOOLS_EXTENSION__) middleware.push(logger)
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducers, composeEnhancers(applyMiddleware(...middleware)))

export default store

import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import { createBrowserHistory as createHistory } from 'history'

import reducer from './reducers'

const history = createHistory()
const middleware = [
  thunk,
  routerMiddleware(history)
]

if (typeof window === 'undefined') {
  global.window = {}
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, composeEnhancers(applyMiddleware(...middleware)))

export default store

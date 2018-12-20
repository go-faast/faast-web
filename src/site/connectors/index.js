import { createStore, applyMiddleware, compose } from 'redux'
import reducer from './reducers'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import { createHashHistory, createBrowserHistory } from 'history'
import config from 'Config'

const createHistory = isIpfs ? createHashHistory : createBrowserHistory

const { isIpfs } = config
const history = createHistory({ basename: process.env.ROUTER_BASE_NAME })
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
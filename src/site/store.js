import { createStore, applyMiddleware, compose } from 'redux'
import thunk from 'redux-thunk'
import { routerMiddleware } from 'react-router-redux'
import { createBrowserHistory as createHistory } from 'history'
import { googleAnalytics } from 'Src/app/reactGA'

import reducer from './reducers'

let history

if (typeof window !== 'undefined') {
  history = createHistory()
}
if (typeof window === 'undefined') {
  global.window = {}
}
const middleware = [
  thunk,
  googleAnalytics,
  routerMiddleware(history)
]

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose
const store = createStore(reducer, composeEnhancers(applyMiddleware(...middleware)))

export default store

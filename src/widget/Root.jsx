import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'

import App from './Components/App'
import store from './store'
import history from './history'
import ReactGA from 'react-ga'

ReactGA.initialize('UA-100689193-1')

ReactGA.set({
  dimension1: 'faast'
})

if (!window.faast) window.faast = {}
window.faast.intervals = {
  orderStatus: [],
  txReceipt: []
}

const Root = () => {
  return (
    <Provider store={store}>
      <App />
    </Provider>
  )
}

export default Root

import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'

import App from 'Components/App'
import store from './store'
import history from './history'

if (!window.faast) window.faast = {}
window.faast.intervals = {
  orderStatus: [],
  txReceipt: []
}

const Root = () => (
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

export default Root

import React from 'react'
import { Provider } from 'react-redux'
import { ConnectedRouter } from 'react-router-redux'
import ReduxToastr from 'react-redux-toastr'

import { I18nextProvider } from 'react-i18next'
import { i18nInitialized, languageChanged, namespaceLoaded } from 'Actions/i18n'
import i18n from './i18n'

import AuthService from 'Services/Auth'
import { AuthProvider } from 'Components/Auth'

import App from 'Components/App'
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
  i18n.on('languageChanged', (lng) => {
    store.dispatch(languageChanged(lng))
  })
  i18n.on('loaded', (loaded) => {
    store.dispatch(namespaceLoaded(loaded))
  })
  i18n.on('initialized', (info) => {
    store.dispatch(i18nInitialized(info))
  })

  const authService = new AuthService()

  return (
    <AuthProvider auth={authService}>
      <I18nextProvider i18n={i18n}>
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
      </I18nextProvider>
    </AuthProvider>
  )
}

export default Root

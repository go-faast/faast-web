import * as React from 'react'
import { Router } from 'react-static'
import { Provider } from 'react-redux'
import { hot } from 'react-hot-loader'
import { compose, setDisplayName } from 'recompose'
import Routes from 'react-static-routes'

import { I18nextProvider } from 'react-i18next'
import i18n from 'Src/app/i18n'

import store from './store'

import './styles/index.scss?global'

export default compose(
  setDisplayName('Root'),
  hot(module),
)(() => {
  return (
  <I18nextProvider i18n={i18n}>
    <Provider store={store}>
      <Router>
        <Routes />
      </Router>
    </Provider>
  </I18nextProvider>
)})

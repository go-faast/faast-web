import React from 'react'
import ReactDOM from 'react-dom'

import log from 'Log'
import { name, version } from 'Pkg'
import Root from './Root'
import './i18n'
import OverlayScrollbars from 'overlayscrollbars'
import { Auth0Provider } from '@auth0/auth0-react'

log.info(`${name} v${version}`)

ReactDOM.render((
  <Auth0Provider
    domain='faast-staging.eu.auth0.com'
    clientId='WUE4HYOZO4xIHoiGYAhDqw0txRuwvFsG'
    redirectUri={window.location.origin}
    audience='https://faa.st/api/v2/'
    scope='read:current_user update:current_user_metadata'
  >
    <Root />
  </Auth0Provider>
), document.getElementById('root'))

OverlayScrollbars(document.body, {
  nativeScrollbarsOverlaid: {
    initialize: true,
  },
  scrollbars: {
    autoHide: 'scroll'
  },
})
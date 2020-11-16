import React from 'react'
import ReactDOM from 'react-dom'

import log from 'Log'
import { name, version } from 'Pkg'
import Root from './Root'
import './i18n'
import OverlayScrollbars from 'overlayscrollbars'

log.info(`${name} v${version}`)

ReactDOM.render((
  <Root />
), document.getElementById('root'))

OverlayScrollbars(document.body, {
  nativeScrollbarsOverlaid: {
    initialize: true,
  },
  scrollbars: {
    autoHide: 'scroll'
  },
})
import React from 'react'
import ReactDOM from 'react-dom'

import log from 'Log'
import { name, version } from 'Pkg'
import Root from './Root'
import Frame from 'react-frame-component'

log.info(`${name} v${version}`)

ReactDOM.render((
  <Root />
), document.getElementById('root'))

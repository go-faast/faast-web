import React from 'react'
import ReactDOM from 'react-dom'

import log from 'Log'
import { name, version } from 'Pkg'
import Root from './Root'

log.info(`${name} v${version}`)

ReactDOM.render((
  <Root />
), document.getElementById('root'))

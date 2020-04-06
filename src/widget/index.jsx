import React from 'react'
import ReactDOM from 'react-dom'

import log from 'Log'
import { name, version } from 'Pkg'

log.info(`${name} v${version}`)

ReactDOM.render((
  <div>Helloooo</div>
), document.getElementById('root'))

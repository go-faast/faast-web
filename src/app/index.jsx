import React from 'react'
import ReactDOM from 'react-dom'
import log from 'Log'
import { version } from 'Pkg'
import Root from './Root'

log.info(`faast-portfolio v${version}`)

ReactDOM.render((
  <Root />
), document.getElementById('root'))

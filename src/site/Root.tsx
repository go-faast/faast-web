import * as React from 'react'
import { Router, Link } from 'react-static'
import { hot } from 'react-hot-loader'
import { compose, setDisplayName } from 'recompose'

import Routes from 'react-static-routes'

import './styles/index.scss?global'

export default compose(
  setDisplayName('Root'),
  hot(module),
)(() => (
  <Router>
    <Routes />
  </Router>
))

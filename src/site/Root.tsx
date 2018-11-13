import * as React from 'react'
import { Router, Link } from 'react-static'
import { hot } from 'react-hot-loader'
import { compose, setDisplayName } from 'recompose'

import Routes from 'react-static-routes'

import './styles/index.scss'

export default compose(
  setDisplayName('Root'),
  hot(module),
)(() => (
  <Router>
    <div>
      <nav>
        <Link exact to='/'>Home</Link>
      </nav>
      <div className='content'>
        <Routes />
      </div>
    </div>
  </Router>
))

import React from 'react'
import { Router, Link } from 'react-static'
import { hot } from 'react-hot-loader'
//
import Routes from 'react-static-routes'

import './styles/index.scss'

const Root = () => (
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
)

export default hot(module)(Root)

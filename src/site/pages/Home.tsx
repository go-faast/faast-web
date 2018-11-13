import * as React from 'react'
import { withSiteData } from 'react-static'
import { compose, setDisplayName } from 'recompose'

// import logoImg from 'Img/faast-logo.png'

export default compose(
  setDisplayName('Home'),
  withSiteData,
)(() => (
  <div>
    <h1 style={{ textAlign: 'center' }}>Welcome to Faast</h1>
    <img src={''} alt='' style={{ display: 'block', margin: '0 auto' }} />
    <a href='./app'>Portfolio</a>
  </div>
))

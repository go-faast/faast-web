import React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Route } from 'react-router-dom'

import { Authenticated } from 'Components/Auth'

export default compose(
  setDisplayName('AuthenticatedRoute'),
)(({ component: Component, ...rest }) => (
  <Route {...rest} render={(props) => (
    <Authenticated>
      <Component {...props}/>
    </Authenticated>
  )}/>
))
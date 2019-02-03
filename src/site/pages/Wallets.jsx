import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'

export default compose(
  setDisplayName('Wallets'),
  withRouteData
)(() => (
  <div>
    
  </div>
))

import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import withTracker from 'Site/components/withTracker'

export default compose(
  setDisplayName('Wallets'),
  withTracker,
  withRouteData
)(() => (
  <div>
    
  </div>
))

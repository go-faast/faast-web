import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'

export default compose(
  setDisplayName('Wallets'),
  withRouteData
)(({ wallets }) => (
  <div>
    <h1>Wallets page</h1>
  </div>
))

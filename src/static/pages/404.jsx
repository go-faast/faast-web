import * as React from 'react'
import { compose, setDisplayName } from 'recompose'

export default compose(
  setDisplayName('404'),
)(() => (
  <div>
    <h1>404 - Oh no's! We couldn't find that page :(</h1>
  </div>
))

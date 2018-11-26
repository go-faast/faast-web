import * as React from 'react'
import { compose, setDisplayName } from 'recompose'

export default compose(
  setDisplayName('404'),
)(() => (
  <div>
    <h1>404 - Oh no&apos;s! We couldn&apos;t find that page :(</h1>
  </div>
))

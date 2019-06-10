import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import withTracker from 'Site/components/withTracker'

export default compose(
  setDisplayName('404'),
  withTracker,
)(() => (
  <div>
    <h1>404 - Oh no&apos;s! We couldn&apos;t find that page :(</h1>
  </div>
))

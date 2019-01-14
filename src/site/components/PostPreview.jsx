import * as React from 'react'
import { compose, setDisplayName } from 'recompose'

export default compose(
  setDisplayName('PostPreview'),
)(({ post }) => (
  <div>
    {console.log(post)}
  </div>
))
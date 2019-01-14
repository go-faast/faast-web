import * as React from 'react'
import { compose, setDisplayName } from 'recompose'

export default compose(
  setDisplayName('BlogPost'),
)(({ post }) => (
  <div>
    <h1>Blog Post</h1>
  </div>
))

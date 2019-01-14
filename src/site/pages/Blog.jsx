import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import PostPreview from 'Site/components/PostPreview'

export default compose(
  setDisplayName('Blog'),
)(({ mediumPosts }) => (
  <div>
    {console.log(mediumPosts)}
    {mediumPosts.map(post => (
      <PostPreview key={post.id} post={post} />
    ))}
  </div>
))

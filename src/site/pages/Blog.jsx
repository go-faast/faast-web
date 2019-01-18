import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Container, Row } from 'reactstrap'

import PostPreview from 'Site/components/PostPreview'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'

export default compose(
  setDisplayName('Blog'),
  withRouteData
)(({ mediumPosts }) => (
  <Container>
    <Header />
    <h4 className='mt-4'>Newest Posts</h4>
    <Row className='pb-5 mb-4'>
      {console.log(mediumPosts)}
      {mediumPosts.map(post => (
        <PostPreview key={post.id} post={post} />
      ))}
    </Row>
    <Footer />
  </Container>
))

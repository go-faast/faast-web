import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import { Container, Row } from 'reactstrap'

import PostPreview from 'Site/components/PostPreview'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'

import { darkText } from 'Site/components/PostPreview/style.scss'
import classNames from 'class-names'

export default compose(
  setDisplayName('Blog'),
  withRouteData
)(({ mediumPosts }) => (
  <Fragment>
    <Header theme='light' />
    <Container>
      <h4 className={classNames(darkText, 'mt-4 font-weight-bold')}>Newest Blog Posts</h4>
      <Row className='pb-5 mb-4'>
        {console.log(mediumPosts)}
        {mediumPosts.map(post => (
          <PostPreview key={post.id} post={post} />
        ))}
      </Row>
    </Container>
    <Footer />
  </Fragment>
))

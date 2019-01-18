import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Card, CardImg, CardBody, Col, CardTitle, CardText } from 'reactstrap'

export default compose(
  setDisplayName('PostPreview'),
)(({ post: { title, uniqueSlug, latestPublishedAt, virtuals: { subtitle, previewImage: { imageId } } } }) => (
  <Col className='mt-3' sm='4'>
    <Card className='h-100'>
      <CardImg top src={`https://cdn-images-1.medium.com/max/1600/${imageId}`} />
      <CardBody>
        <CardTitle tag='a' style={{ color: 'white' }} href={`/blog/${uniqueSlug}`}><h5>{title}</h5></CardTitle>
        <CardText className='text-muted'>{subtitle}</CardText>
        <CardText>
          <small className='text-muted'>Posted {Date.parse(latestPublishedAt)}</small>
        </CardText>
      </CardBody>
    </Card>
  </Col>
))
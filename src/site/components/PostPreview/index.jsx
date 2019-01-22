import * as React from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { Card, CardImg, CardBody, Col, CardTitle, CardText } from 'reactstrap'

import { card, darkText, subtitleText } from './style.scss'
import classNames from 'class-names'

export default compose(
  setDisplayName('PostPreview')
)(({ post: { title, uniqueSlug, latestPublishedAt, virtuals: { subtitle, previewImage: { imageId } } } }) => (
  <Col className='mt-3' sm='4'>
    <Card className={classNames(card, 'h-100')}>
      <CardImg top src={`https://cdn-images-1.medium.com/max/1600/${imageId}`} />
      <CardBody>
        <CardTitle className={darkText} tag='a' href={`/blog/${uniqueSlug}`}>
          <h5 className='font-weight-bold'>{title}</h5>
        </CardTitle>
        <CardText className={subtitleText}>{subtitle}</CardText>
        <CardText>
          <small className='text-muted'>Posted {Date.parse(latestPublishedAt)}</small>
        </CardText>
      </CardBody>
    </Card>
  </Col>
))
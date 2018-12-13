import React from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'
import { Row, Col, Card, Input, CardHeader, CardBody, Button } from 'reactstrap'
import classNames from 'class-names'

import { affiliateId, secretKey } from 'Selectors/affiliate'

import AffiliateLayout from 'Components/Affiliate/Layout'
import { card, cardHeader, input, text } from '../style'

const AffiliateSettings = ({ affiliateId, secretKey }) => {
  return (
    <AffiliateLayout className='pt-3'>
      <Row className='mt-4'>
        <Col>
          <Card className={classNames('mx-auto', card)}>
            <CardHeader className={cardHeader}>Affiliate API Settings</CardHeader>
            <CardBody>
              <Row>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Affiliate Id</p></small>
                  <Input className={classNames('flat', input)} value={affiliateId} type='text' autoFocus readOnly/>
                </Col>
                <Col sm='12'>
                  <small><p className={classNames('mt-3 mb-1 font-weight-bold', text)}>Secret Key</p></small>
                  <Input className={classNames('flat', input)} value={secretKey} type='text' autoFocus readOnly/>
                </Col>
                <Col>
                  <small><p className={classNames('mt-3 mb-1 font-weight-bold', text)}>Initiate Withdrawal</p></small>
                  <Button color='primary' className='flat'>Withdrawal</Button>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliateSettings'),
  connect(createStructuredSelector({
    affiliateId,
    secretKey,
  }), {
  }),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
)(AffiliateSettings)

import React from 'react'
import * as validator from 'Utilities/validator'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'
import { Row, Col, Card, Input, CardHeader, CardBody, Button, Form } from 'reactstrap'
import classNames from 'class-names'
import { reduxForm, formValueSelector } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'

import { affiliateId, secretKey, getAsset } from 'Selectors'
import { initiateAffiliateWithdrawal } from 'Services/Faast'

import AffiliateLayout from 'Components/Affiliate/Layout'
import { card, cardHeader, input, text } from '../style'

const AffiliateSettings = ({ affiliateId, secretKey, handleSubmit, validateWithdrawalAddress, invalid }) => {
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
                  <Form onSubmit={handleSubmit}>
                    <ReduxFormField
                      name='withdrawal_address'
                      type='text'
                      placeholder='Enter a BTC Withdrawal Address'
                      inputClass={classNames('flat', input)}
                      validate={validateWithdrawalAddress}
                    />
                    <Button className='flat' color='primary' type='submit' disabled={invalid}>Withdrawal</Button>
                  </Form>
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
    bitcoin: (state) => getAsset(state, 'BTC'),
  }), {
  }),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
    onSubmit: ({ affiliateId, secretKey }) => ({ withdrawal_address }) => {
      initiateAffiliateWithdrawal(withdrawal_address, affiliateId, secretKey)
    },
    validateWithdrawalAddress: ({ bitcoin }) => validator.all(
      validator.required(),
      validator.walletAddress(bitcoin)
    ),
  }),
  reduxForm({
    form: 'affiliate_withdrawal',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(AffiliateSettings)

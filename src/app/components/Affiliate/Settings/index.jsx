import React from 'react'
import * as validator from 'Utilities/validator'
import { Link } from 'react-router-dom'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { compose, setDisplayName, withHandlers } from 'recompose'
import { Row, Col, Card, Input, CardHeader, CardBody, Button, Form, Modal, ModalBody, ModalHeader } from 'reactstrap'
import withToggle from 'Hoc/withToggle'
import classNames from 'class-names'
import { reduxForm, formValueSelector, change, untouch } from 'redux-form'
import ReduxFormField from 'Components/ReduxFormField'
import toastr from 'Utilities/toastrWrapper'
import config from 'Config'

import { affiliateId, secretKey, getAsset, getAffiliateBalance, getMinimumWithdrawal } from 'Selectors'
import { initiateAffiliateWithdrawal } from 'Services/Faast'

import AffiliateLayout from 'Components/Affiliate/Layout'
import { card, cardHeader, input, text, smallCard } from '../style'

const FORM_NAME = 'affiliate_withdrawal'

const getFormValue = formValueSelector(FORM_NAME)

const AffiliateSettings = ({ minimumWithdrawal, isModalOpen, toggleModalOpen, affiliateId, secretKey, 
  handleSubmit, validateWithdrawalAddress, invalid, balance, withdrawalAddress }) => {
  return (
    <AffiliateLayout className='pt-3'>
      <Row className='mt-4'>
        <Col>
          <Card className={classNames('mx-auto', card, smallCard)}>
            <CardHeader className={cardHeader}>Affiliate API Settings</CardHeader>
            <CardBody>
              <Row className='gutter-y-3'>
                <Col sm='12'>
                  <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Affiliate Id</p></small>
                  <Input className={classNames('flat', input)} value={affiliateId} type='text' autoFocus readOnly/>
                </Col>
                <Col sm='12'>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Secret Key</p></small>
                  <Input className={classNames('flat', input)} value={secretKey} type='text' autoFocus readOnly/>
                </Col>
                <hr className='w-100 border-light'/>
                <Col sm='12'>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Referral Link</p></small>
                  <Input className={classNames('flat', input)} value={`https://faa.st/swap?aid=${affiliateId}`} type='text' autoFocus readOnly/>
                  <small><p className={classNames('mt-1 mb-1', text)}>
                    Receive {config.affiliateSettings.affiliate_margin}% commission on any swap placed using this link.
                  </p></small>
                </Col>
                <hr className='w-100 border-light'/>
                <Col>
                  <small><p className={classNames('mb-1 font-weight-bold', text)}>Initiate Earnings Withdrawal</p></small>
                  <Form id='withdrawal-form' onSubmit={handleSubmit}>
                    <ReduxFormField
                      name='withdrawal_address'
                      type='text'
                      placeholder='Enter a BTC Withdrawal Address'
                      inputClass={classNames('flat', input)}
                      validate={validateWithdrawalAddress}
                    />
                    <Button type='button' 
                      className='flat' 
                      color='primary' 
                      onClick={toggleModalOpen} 
                      disabled={invalid || balance < minimumWithdrawal}
                    >
                      {balance == 0 ? 'Cannot withdrawal 0 BTC' : 'Withdrawal'}
                    </Button>
                    {minimumWithdrawal && (
                      <p className={classNames('mt-2',text)}>
                        <small>** The minimum withdrawal is: {minimumWithdrawal} BTC</small>
                      </p>
                    )}
                    <Modal
                      size='md' isOpen={isModalOpen} toggle={toggleModalOpen} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames('p-0 border-0 flat')}>
                      <ModalHeader close={<span className='cursor-pointer' onClick={toggleModalOpen}>cancel</span>} tag='h4' toggle={toggleModalOpen} className={cardHeader}>
                        Confirm Withdrawal
                      </ModalHeader>
                      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
                        <Row>
                          <Col sm='12'>
                            <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Amount to be Withdrawn</p></small>
                            <Input className={classNames('flat', input)} value={`${balance} BTC`} type='text' autoFocus readOnly/>
                          </Col>
                          <Col sm='12'>
                            <small><p className={classNames('mt-3 mb-1 font-weight-bold', text)}>BTC Wallet Address</p></small>
                            <Input className={classNames('flat', input)} value={withdrawalAddress} type='text' autoFocus readOnly/>
                            <Button 
                              className='flat mt-3 d-block w-100' 
                              type='submit' 
                              form='withdrawal-form' 
                              color='primary'
                            >
                              Confirm Withdrawal
                            </Button>
                          </Col>
                        </Row>
                      </ModalBody>
                    </Modal>
                  </Form>
                </Col>
              </Row>
            </CardBody>
          </Card>
          <Link to='/affiliates/terms' style={{ color: '#8aa2b5' }} className='pt-3 d-block font-weight-bold font-xs text-center'>
              Read the Faa.st Affiliate Terms
          </Link>
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
    balance: getAffiliateBalance,
    bitcoin: (state) => getAsset(state, 'BTC'),
    withdrawalAddress: (state) => getFormValue(state, 'withdrawal_address'),
    minimumWithdrawal: getMinimumWithdrawal
  }), {
    change: change,
    untouch: untouch,
  }),
  withToggle('modalOpen'),
  withHandlers({
    onSubmit: ({ affiliateId, secretKey, toggleModalOpen, change, untouch }) => ({ withdrawal_address }) => {
      initiateAffiliateWithdrawal(withdrawal_address, affiliateId, secretKey)
        .then(() => {
          toggleModalOpen()
          change(FORM_NAME, 'withdrawal_address', null)
          untouch(FORM_NAME, 'withdrawal_address')
          toastr.info('Withdrawal successfully initiated.')
          
        })
        .catch(() => {
          toggleModalOpen()
          change(FORM_NAME, 'withdrawal_address', null)
          untouch(FORM_NAME, 'withdrawal_address')
          toastr.error('There was an issue initiating your withdrawal. Please try again.')
        })
    },
    validateWithdrawalAddress: ({ bitcoin }) => validator.all(
      validator.required(),
      validator.walletAddress(bitcoin)
    ),
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(AffiliateSettings)

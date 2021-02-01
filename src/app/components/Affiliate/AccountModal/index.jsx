import React from 'react'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'

import { affiliateId, secretKey, } from 'Selectors'

import { modalShadow, apiDocs } from './style'
import { cardHeader, input, text } from '../style'

export default compose(
  setDisplayName('AccountInfoModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    affiliateId,
    secretKey,
  }), {
  }),
)(({ affiliateId, secretKey, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(modalShadow, cardHeader, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
      Affiliate Account Info
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Affiliate Id</p></small>
            <Input className={classNames('flat', input)} value={affiliateId} type='text' autoFocus readOnly/>
          </Col>
          <Col sm='12'>
            <small><p className={classNames('mt-3 mb-1 font-weight-bold', text)}>Secret Key</p></small>
            <Input className={classNames('flat', input)} value={secretKey} type='text' autoFocus readOnly/>
          </Col>
          <small><p className='text-danger font-weight-bold pl-3 pt-3'>
            * Save these credentials somewhere safe. You will need them to access the affiliate dashboard and authenticate API requests.
          </p>
          </small>
          <Col>
            <div className={classNames('p-3 mt-2 text-center', apiDocs)}>
              <a href='https://api.faa.st' target='_blank noopener noreferrer'>Get started with the Faa.st API Docs</a>
            </div>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
})

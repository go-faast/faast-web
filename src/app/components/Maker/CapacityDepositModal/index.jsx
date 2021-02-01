import React from 'react'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'

import { getCapacityAddress } from 'Selectors/maker'

import { modalShadow } from './style'
import { cardHeader, input, text } from '../style'

export default compose(
  setDisplayName('CapacityDepositModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    capacityAddress: getCapacityAddress,
  }), {
  }),
)(({ capacityAddress, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Deposit BTC to your Capacity Address
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            {capacityAddress ? (
              <div>
                <small>
                  <p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Capacity Address</p>
                </small>
                <Input className={classNames('flat', input)} value={capacityAddress} type='text' autoFocus readOnly/>
                <small><p className='text-danger font-weight-bold pl-3 pt-3'>
                  * The amount of BTC you deposit to your capacity address is the maximum amount of swap value you will be able to fulfill at any given time.
                </p>
                </small>
              </div>
            ) : (
              <p className='text-center'>Your capacity address will be created and ready for deposits after you have finished setting up your Maker Bot.</p>
            )} 
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  )
})

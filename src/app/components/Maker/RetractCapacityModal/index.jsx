import React from 'react'
import { compose, setDisplayName, setPropTypes, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input, Button } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'

import { getCapacityAddress, getCapacityBalance } from 'Selectors/maker'
import { retractCapacity } from 'Actions/maker'

import { modalShadow } from './style'
import { cardHeader, input, text } from '../style'

export default compose(
  setDisplayName('RetractCapacityModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    capacityAddress: getCapacityAddress,
    capacityBalance: getCapacityBalance
  }), {
    retractCapacity
  }),
  withState('amount', 'updateAmount', undefined),
  withState('amountError', 'updateAmountError', ''),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    handleRetract: ({ capacityBalance, amount = 0, retractCapacity, updateAmountError, updateIsLoading }) => async () => {
      updateIsLoading(true)
      if (amount > parseFloat(capacityBalance)) {
        updateAmountError('Cannot withdrawal more BTC than you have.')
        updateIsLoading(false)
        return
      }
      updateAmountError('')
      await retractCapacity(amount)
      updateIsLoading(false)
    }
  })
)(({ amount, capacityBalance, amountError, isLoading, updateAmount, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Withdrawal BTC from your Capacity Address
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            <p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Capacity Address</p>
            <small><p>Current Capacity Balance: {capacityBalance} BTC</p></small>
            <Input 
              className={classNames('flat', input)} 
              onChange={(e) => updateAmount(e.target.value)}
              placeholder='Amount BTC'
              value={amount} 
              type='number' 
            />
            {amountError ? (
              <span style={{ color: 'red' }}>{amountError}</span>
            ) : null}
           
            <Button
              color='primary'
              className='w-100 flat mt-3'
              size='md'
              disabled={isLoading}
            >
              Withdrawal Capacity
            </Button>
          </Col>
          <small><p className='text-danger font-weight-bold pl-3 pt-3'>
            * Remember, the balance of your capacity address is the maximum value of swaps you can fulfill at any one time.
          </p>
          </small>
        </Row>
      </ModalBody>
    </Modal>
  )
})

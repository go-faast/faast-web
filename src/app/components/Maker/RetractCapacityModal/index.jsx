import React from 'react'
import { compose, setDisplayName, setPropTypes, withHandlers, withState } from 'recompose'
import { connect } from 'react-redux'
import * as validator from 'Utilities/validator'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Button, Form } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import { pick } from 'lodash'
import classNames from 'class-names'

import { getCapacityAddress, getCapacityBalance } from 'Selectors/maker'
import ReduxFormField from 'Components/ReduxFormField'
import Units from 'Components/Units'
import { retractCapacity } from 'Actions/maker'

import { modalShadow } from './style'
import { cardHeader, input, text } from '../style'

const FORM_NAME = 'maker_retract'
const getFormValue = formValueSelector(FORM_NAME)

export default compose(
  setDisplayName('RetractCapacityModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    capacityAddress: getCapacityAddress,
    capacityBalance: getCapacityBalance,
    amount: (state) => getFormValue(state, 'amount'),
  }), {
    retractCapacity
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withState('isLoading', 'updateIsLoading', false),
  withHandlers({
    onSubmit: ({ retractCapacity, updateIsLoading }) => async ({ amount }) => {
      updateIsLoading(true)
      await retractCapacity(amount)
      updateIsLoading(false)
    },
    handleSetMax: ({ change, capacityBalance }) => () => {
      change('amount', capacityBalance)
    },
    validateAmount: ({ capacityBalance }) => validator.all(
      validator.required(),
      validator.greaterThan(0, 'Amount must be greater than 0.'),
      validator.lessThanOrEqualTo(capacityBalance, 'Cannot withdraw more capacity than you have.')
    ),
  })
)(({ capacityBalance, isLoading, handleSubmit, handleSetMax, validateAmount, invalid,
  toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(cardHeader, modalShadow, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={<span className='cursor-pointer' onClick={toggle}>close</span>} tag='h4' toggle={toggle} className={cardHeader}>
        Reduce Your BTC Capacity
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            <Form onSubmit={handleSubmit}>
              <div className='mt-0 mb-3'>
                <ReduxFormField 
                  name='amount'
                  label={<p className={classNames('font-weight-bold m-0', text)}>Amount to reduce (BTC)</p>}
                  inputClass={classNames('flat', input)} 
                  placeholder='Amount BTC'
                  validate={validateAmount}
                  type='number' 
                />
              </div>
              <small><p className='mt-2'>Current Capacity Balance: 
                <Button color='link-plain ml-2' onClick={handleSetMax}>
                  <Units roundingType='dp' value={capacityBalance} showSymbol symbol={'BTC'} />
                </Button></p></small>
              <Button
                color='primary'
                className='w-100 flat mt-0'
                size='md'
                type='submit'
                disabled={invalid || isLoading}
              >
                Reduce Capacity To Exchange
              </Button>
            </Form>
          </Col>
          <small><p className='text-gray font-weight-bold pl-3 pt-3'>
            * Remember, the balance of your capacity address is the maximum value of swaps you can fulfill at any one time.
          </p>
          </small>
        </Row>
      </ModalBody>
    </Modal>
  )
})

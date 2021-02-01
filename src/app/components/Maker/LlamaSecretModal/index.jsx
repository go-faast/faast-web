import React from 'react'
import { compose, setDisplayName, setPropTypes, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader, Row, Col, Input, Button } from 'reactstrap'
import { pick } from 'lodash'
import classNames from 'class-names'

import { getMakerSecret } from 'Selectors/maker'
import { removeSecretKey } from 'Actions/maker'

import { modalShadow } from './style'
import { cardHeader, input, text } from '../style'

export default compose(
  setDisplayName('LLaamaSecretModal'),
  setPropTypes({
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
    secretKey: getMakerSecret,
  }), {
    removeSecretKey
  }),
  withHandlers({
    handleKeyIsSaved: ({ toggle, removeSecretKey }) => () => {
      removeSecretKey()
      toggle()
    }
  })
)(({ secretKey, handleKeyIsSaved, toggle, ...props }) => {
  return (
    <Modal
      size='md' toggle={toggle} className={'border-0 mt-6 mx-md-auto'} contentClassName={classNames(modalShadow, cardHeader, 'p-0 border-0 flat')}
      {...pick(props, Object.keys(Modal.propTypes))}>
      <ModalHeader close={undefined} tag='h4' toggle={toggle} className={cardHeader}>
        Your Maker Secret Key
      </ModalHeader>
      <ModalBody className={classNames(cardHeader, 'p-0 p-sm-3')}>
        <Row>
          <Col sm='12'>
            <small><p className={classNames('mt-1 mb-1 font-weight-bold', text)}>Maker Secret Key</p></small>
            <Input className={classNames('flat', input)} value={secretKey} type='text' autoFocus readOnly/>
          </Col>
          <Col xs='12'>
            <small><p className='text-danger font-weight-bold pl-3 pt-3'>
              * Before continuing, write down your secret key somewhere offline and safe. You will not be shown this key again.
            </p>
            </small>
          </Col>
          <Col className='text-center' xs='12'>
            <Button
              onClick={handleKeyIsSaved}
              color='primary'
              className='w-100'
            >
              I have saved my secret key in a safe place
            </Button>
          </Col>
          
        </Row>
      </ModalBody>
    </Modal>
  )
})

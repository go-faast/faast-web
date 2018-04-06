import React from 'react'
import { reduxForm } from 'redux-form'
import {
  Row, Col, Button, Form,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap'

import SwapStatusCard from 'Components/SwapStatusCard'

const submitButtonText = 'Approve & Sign'

const SignTxForm = reduxForm({
  form: 'signTxForm'
})(({ handleSubmit, handleCancel, swaps, isSigning, readyToSign }) => {
  let nextToSign = 0
  const signingStatuses = swaps.map((swap, i) => {
    let status
    if (swap.error) {
      nextToSign += 1
      status = (<span className='text-danger'>declined</span>)
    } else if (swap.tx && swap.tx.signed) {
      nextToSign += 1
      status = (<span className='text-success'>approved</span>)
    } else if (isSigning && i === nextToSign) {
      status = (<span className='text-warning blink'>awaiting signature</span>)
    }
    return (
      <Col xs='12' key={i}>
        <SwapStatusCard swap={swap} showFees statusText={status}/>
      </Col>
    )
  })
  return (
    <Form onSubmit={handleSubmit}>
      <ModalHeader className='text-primary'>
        Review and Sign
      </ModalHeader>
      <ModalBody className='modal-text'>
        <p>
          The following swaps will take place to save the changes you made to your wallet. Please review them and click {`"${submitButtonText}"`} to proceed.
        </p>
        <div className='my-3'>
          <Row className='gutter-2'>
            {signingStatuses}
          </Row>
        </div>
        <p><small className='text-muted'>
          The receive amount is an estimate based on the current Faast market rate and swap fee. Actual amount may vary.
        </small></p>
      </ModalBody>
      <ModalFooter className='justify-content-between'>
        <Button type='button' color='primary' outline onClick={handleCancel}>cancel</Button>
        <Button type='submit' color='primary' disabled={!readyToSign || isSigning}>
          {submitButtonText}
        </Button>
      </ModalFooter>
    </Form>
  )
})

const SignTxModal = ({ isOpen, toggle, ...props }) => (
  <Modal size='lg' backdrop='static' isOpen={isOpen} toggle={toggle}>
    {isOpen && (<SignTxForm {...props} />)}
  </Modal>
)

export default SignTxModal

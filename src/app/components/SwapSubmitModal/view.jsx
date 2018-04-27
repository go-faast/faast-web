import React from 'react'
import {
  Row, Col, Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap'

import SwapStatusCard from 'Components/SwapStatusCard'

const SwapSubmitModal = ({ isOpen, swaps, headerText, continueText, continueDisabled, continueLoading, handleContinue, handleCancel }) => {
  const signingStatuses = swaps.map((swap, i) => {
    const { tx, status: { detailsCode, labelClass, label } } = swap
    let statusText
    if (detailsCode === 'signed') {
      statusText = (<span className='text-success'>Signed</span>)
    } else if (detailsCode === 'signing') {
      statusText = (<span className='text-warning blink'>Awaiting signature</span>)
    } else if (detailsCode.includes('error')) {
      statusText = (<span className='text-danger'>Failed</span>)
    } else if (detailsCode === 'sending') {
      statusText = (<span className='text-primary'>Sending</span>)
    } else if (tx && tx.sent) {
      statusText = (<span className={labelClass}>{label}</span>)
    }
    return (
      <Col xs='12' key={i}>
        <SwapStatusCard swap={swap} statusText={statusText}/>
      </Col>
    )
  })
  return (
    <Modal size='lg' backdrop='static' isOpen={isOpen} toggle={handleCancel}>
      <ModalHeader className='text-primary' toggle={handleCancel}>
        {headerText}
      </ModalHeader>
      <ModalBody className='modal-text'>
        <p>
          The following swaps will take place to save the changes you made to your portfolio. Please review them and click {`"${continueText}"`} to proceed.
        </p>
        <div className='my-3'>
          <Row className='gutter-2'>
            {signingStatuses}
          </Row>
        </div>
        <p><small className='text-muted'>
          {'* The receive amount is an estimate based on the current Faast market rate. '
          + 'Actual amount may vary. Additional transaction fees may apply depending on '
          + 'the asset being sent and the wallet you\'re using.'}
        </small></p>
      </ModalBody>
      <ModalFooter className='justify-content-between'>
        <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
        <Button type='submit' color='primary' disabled={continueDisabled} onClick={handleContinue}>
          {continueText}
          {continueLoading && (<i className='fa fa-spinner fa-pulse ml-2'/>)}
        </Button>
      </ModalFooter>
    </Modal>
  )
}

export default SwapSubmitModal

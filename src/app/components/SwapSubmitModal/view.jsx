import React from 'react'
import {
  Row, Col, Button,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap'

import SwapStatusCard from 'Components/SwapStatusCard'

const SwapSubmitModal = ({ isOpen, swaps, continueText, continueDisabled, handleContinue, handleCancel }) => {
  const signingStatuses = swaps.map((swap, i) => {
    console.log('swap', swap)
    let status
    if (swap.status.detailsCode === 'signed') {
      status = (<span className='text-success'>Signed</span>)
    } else if (swap.status.detailsCode === 'signing') {
      status = (<span className='text-warning blink'>Awaiting signature</span>)
    } else if (swap.tx.sent) {
      status = (<span className={swap.status.labelClassName}>{swap.status.label}</span>)
    }
    return (
      <Col xs='12' key={i}>
        <SwapStatusCard swap={swap} showFees statusText={status}/>
      </Col>
    )
  })
  return (
    <Modal size='lg' backdrop='static' isOpen={isOpen} toggle={handleCancel}>
      <ModalHeader className='text-primary' toggle={handleCancel}>
        Review and Sign
      </ModalHeader>
      <ModalBody className='modal-text'>
        <p>
          The following swaps will take place to save the changes you made to your wallet. Please review them and click {`"${continueText}"`} to proceed.
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
        <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
        <Button type='submit' color='primary' disabled={continueDisabled} onClick={handleContinue}>{continueText}</Button>
      </ModalFooter>
    </Modal>
  )
}

export default SwapSubmitModal

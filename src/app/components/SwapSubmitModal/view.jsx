import React from 'react'
import {
  Row, Col, Button, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter
} from 'reactstrap'
import display from 'Utilities/display'
import { compose, setDisplayName, setPropTypes, defaultProps, withState } from 'recompose'
import SwapStatusCard from 'Components/SwapStatusCard'
import Timer from '../Timer'
import Spinner from 'Components/Spinner'
import ConfirmTransactionModal from 'Components/ConfirmTransactionModal'
import PropTypes from 'prop-types'

const SwapSubmitModal = ({
  isOpen, swundle, headerText, continueText, continueDisabled, continueLoading,
  errorMessage, handleContinue, handleCancel, currentSwap, secondsUntilPriceExpiry, showTimer, shouldShowTimer
}) => (
  <div>
    <Modal size='lg' backdrop='static' isOpen={isOpen} toggle={handleCancel}>
      <ModalHeader className='text-primary' toggle={handleCancel}>
        {headerText}
      </ModalHeader>
      <ModalBody className='modal-text'>
        {errorMessage && (
          <Alert color='danger'>{errorMessage}</Alert>
        )}
        <p>
          The following swaps will take place to save the changes you made to your portfolio. Please review them and click {`"${continueText}"`} to proceed.
        </p>
        <div className='my-3'>
          <Row className='gutter-2'>
            {swundle.swaps.map((swap) => {
              const { id, tx, status: { code, detailsCode, labelClass, label } } = swap
              let statusText
              if (detailsCode === 'signed') {
                statusText = (<span className='text-success'>Signed</span>)
              } else if (detailsCode === 'signing_unsupported') {
                statusText = (<span className='text-success'>Ready</span>)
              } else if (detailsCode === 'signing') {
                statusText = (<span className='text-warning blink'>Awaiting signature</span>)
              } else if (detailsCode.includes('error')) {
                statusText = (<span className='text-danger'>Failed</span>)
              } else if (detailsCode === 'sending') {
                statusText = (<span className='text-primary'>Sending</span>)
              } else if ((tx && tx.sent) || code === 'failed') {
                statusText = (<span className={labelClass}>{label}</span>)
              } else if (detailsCode !== 'unsigned') {
                statusText = (<Spinner size='sm' inline/>)
              }
              return (
                <Col xs='12' key={id}>
                  <SwapStatusCard swap={swap} statusText={statusText} />
                </Col>
              )
            })}
          </Row>
        </div>
        <p>Total network fee: {swundle.totalTxFee
          ? display.fiat(swundle.totalTxFee)
          : <Spinner inline size='sm'/>}
        </p>
        {(secondsUntilPriceExpiry > 0 && showTimer)
          ? <span><small><Timer className='text-warning' seconds={secondsUntilPriceExpiry} label={'* Swap rates guaranteed if deposits received by:'} onTimerEnd={() => { shouldShowTimer(false) }}/></small></span> 
          : !showTimer
          ? <span className='text-warning'><small>* Fixed rate is no longer guaranteed as the 15 minute locked-rate period has concluded.</small></span>
          : null}
        <p><small className='text-muted'>
          {'** Additional fees may apply depending on '
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
    <ConfirmTransactionModal swap={currentSwap} handleCancel={handleCancel}/>
  </div>
)

export default compose(
  setDisplayName('SwapSubmitModalView'),
  setPropTypes({
    headerText: PropTypes.node,
    continueDisabled: PropTypes.bool,
    continueLoading: PropTypes.bool,
    continueText: PropTypes.node,
    handleContinue: PropTypes.func,
    handleCancel: PropTypes.func,
    errorMessage: PropTypes.node,
    currentSwap: PropTypes.object,
    secondsUntilPriceExpiry: PropTypes.number
  }),
  defaultProps({
    headerText: null,
    continueDisabled: true,
    continueLoading: true,
    continueText: null,
    handleContinue: () => {},
    handleCancel: () => {},
    errorMessage: null,
    currentSwap: {},
    secondsUntilPriceExpiry: 0
  }),
  withState('showTimer', 'shouldShowTimer', true)
)(SwapSubmitModal)

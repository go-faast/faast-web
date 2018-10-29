import React, { Fragment } from 'react'
import {
  Row, Col, Button, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Form
} from 'reactstrap'
import { reduxForm } from 'redux-form'
import Checkbox from 'Components/Checkbox'
import {
  getCurrentSwundle, 
  isCurrentSwundleReadyToSign, isCurrentSwundleReadyToSend,
  isCurrentSwundleSigning, isCurrentSwundleSending,
  doesCurrentSwundleRequireSigning,
} from 'Selectors'
import { compose, setDisplayName, withProps, branch, withHandlers, renderNothing } from 'recompose'
import { closeTrezorWindow } from 'Utilities/wallet'
import { min } from 'lodash'
import display from 'Utilities/display'
import SwapStatusCard from 'Components/SwapStatusCard'
import Timer from '../Timer'
import Spinner from 'Components/Spinner'
import ConfirmTransactionModal from 'Components/ConfirmTransactionModal'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { signSwundle, sendSwundle, removeSwundle } from 'Actions/swundle'
import { toggleOrderModal } from 'Actions/orderModal'
import { refreshSwap } from 'Actions/swap'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'

const SwapSubmitModal = ({
  isOpen, swundle, headerText, continueText, continueDisabled, continueLoading,
  errorMessage, handleCancel, currentSwap, secondsUntilPriceExpiry, 
  handleTimerEnd, handleSubmit, invalid, submitting
}) => { 
  return (
    <Fragment>
      <Modal size='lg' backdrop='static' isOpen={isOpen} toggle={handleCancel}>
      <Form onSubmit={handleSubmit}>
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
          {(secondsUntilPriceExpiry > 0)
            ? (<span><small><Timer className='text-warning' seconds={secondsUntilPriceExpiry} label={'* Quoted rates are guaranteed if submitted within:'} onTimerEnd={handleTimerEnd}/></small></span>)
            : null}
          <p><small className='text-muted'>
            {'** Additional fees may apply depending on '
            + 'the asset being sent and the wallet you\'re using.'}
          </small></p>
          <Checkbox
            label={
              <small className='pl-1 text-white'>I accept the 
                <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faast Terms & Conditions</a>
              </small>
            }
            labelClass='p-0'
          />
        </ModalBody>
        <ModalFooter className='justify-content-between'>
          <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
          <Button type='submit' color='primary' disabled={continueDisabled || invalid || submitting}>
            {continueText}
            {continueLoading && (<i className='fa fa-spinner fa-pulse ml-2'/>)}
          </Button>
        </ModalFooter>
        </Form>
      </Modal>
      <ConfirmTransactionModal swap={currentSwap} handleCancel={handleCancel}/>
      </Fragment>
  )}

export default compose(
  setDisplayName('SwapSubmitModal'),
  connect(createStructuredSelector({
    swundle: getCurrentSwundle,
    requiresSigning: doesCurrentSwundleRequireSigning,
    readyToSign: isCurrentSwundleReadyToSign,
    readyToSend: isCurrentSwundleReadyToSend,
    startedSigning: isCurrentSwundleSigning,
    startedSending: isCurrentSwundleSending,
    isOpen: ({ orderModal: { show } }) => show,
  }), {
    toggle: toggleOrderModal,
    removeSwundle,
    signSwundle,
    sendSwundle,
    routerPush: push,
    refreshSwap,
  }),
  withHandlers({
    handleCancel: ({ swundle, toggle, removeSwundle }) => () => {
      closeTrezorWindow()
      toggle()
      removeSwundle(swundle)
    },
    handleSignTxs: ({ swundle, signSwundle }) => () => {
      signSwundle(swundle)
      .then(() => closeTrezorWindow())
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
        closeTrezorWindow()
      })
    },
    handleSendTxs: ({ swundle, sendSwundle, toggle, routerPush }) => () => {
      sendSwundle(swundle)
      .then((updatedSwundle) => {
        if (updatedSwundle.swaps.every((swap) => swap.tx.sent)) {
          toggle()
          routerPush('/dashboard')
        }
      })
      .catch((e) => {
        toastr.error(e.message || e)
        log.error(e)
      })
    }
  }),
  branch(
    ({ swundle }) => !swundle,
    renderNothing
  ),
  withProps(({ swundle, requiresSigning, readyToSign, readyToSend, startedSigning, startedSending }) => {
    let errorMessage = swundle.error
    const soonestPriceExpiry = min(swundle.swaps.map(swap => swap.rateLockedUntil))
    const secondsUntilPriceExpiry = (Date.parse(soonestPriceExpiry) - Date.now()) / 1000
    const currentSwap = swundle.swaps.find(({ txSigning, txSending, sendWallet }) =>
      txSigning || (txSending && sendWallet && !sendWallet.isSignTxSupported))
    const showSubmit = !requiresSigning || startedSigning // True if continue button triggers tx sending, false for signing
    const continueDisabled = showSubmit ? (!readyToSend || startedSending) : (!readyToSign || startedSigning)
    const continueLoading = showSubmit ? startedSending : startedSigning
    const continueText = showSubmit ? 'Submit all' : 'Begin signing'
    const headerText = showSubmit ? 'Confirm and Submit' : 'Review and Sign'
    return {
      errorMessage,
      showSubmit,
      soonestPriceExpiry,
      secondsUntilPriceExpiry,
      currentSwap,
      continueDisabled,
      continueLoading,
      continueText,
      headerText
    }
  }),
  withHandlers({
    onSubmit: ({ showSubmit, handleSendTxs, handleSignTxs }) => () => showSubmit ? handleSendTxs() : handleSignTxs(),
    handleTimerEnd: ({ refreshSwap, swundle }) => () => {
      swundle.swaps.map(swap => refreshSwap(swap.orderId))
    }
  }),
  reduxForm({
    form: 'termsForm'
  })
)(SwapSubmitModal)

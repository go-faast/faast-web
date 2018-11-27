import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
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
import {
  compose, setDisplayName, setPropTypes, defaultProps,
  withProps, branch, withHandlers, renderNothing,
} from 'recompose'
import Trezor from 'Services/Trezor'
import { min } from 'lodash'
import display from 'Utilities/display'
import SwapStatusCard from 'Components/SwapStatusCard'
import Timer from 'Components/Timer'
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
import routes from 'Routes'

const RenderChildren = ({ children }) => children
const RenderNothing = () => null

const SwapSubmitModal = ({
  isOpen, swundle, headerText, continueText, continueDisabled, continueLoading,
  errorMessage, handleCancel, currentSwap, secondsUntilPriceExpiry, 
  handleTimerEnd, handleSubmit, invalid, submitting, modal, termsAccepted, singleSwap,
}) => {
  const Wrapper = modal ? Modal : RenderChildren
  const Header = modal ? ModalHeader : RenderNothing
  const Body = modal ? ModalBody : RenderChildren
  const Footer = modal ? ModalFooter : RenderChildren
  return (
    <Fragment>
      <Wrapper size='lg' backdrop='static' isOpen={isOpen} toggle={handleCancel}>
        <Form onSubmit={handleSubmit}>
          <Header className='text-primary' toggle={handleCancel}>
            {headerText}
          </Header>
          <Body className='modal-text'>
            {errorMessage && (
              <Alert color='danger'>{errorMessage}</Alert>
            )}
            {!singleSwap && (
              <p>
                The following swaps will take place to save the changes you made to your portfolio. Please review them and click {`"${continueText}"`} to proceed.
              </p>
            )}
            <div className='my-3'>
              <Row className='gutter-2'>
                {swundle.swaps.map((swap) => (
                  <Col xs='12' key={swap.id}>
                    <SwapStatusCard swap={swap} showShortStatus expanded={singleSwap ? true : null}/>
                  </Col>
                ))}
              </Row>
            </div>
            {!singleSwap && (
              <p>Total network fee: {swundle.totalTxFee
                ? display.fiat(swundle.totalTxFee)
                : <Spinner inline size='sm'/>}
              </p>
            )}
            {(secondsUntilPriceExpiry > 0)
              ? (<span><small><Timer className='text-warning' seconds={secondsUntilPriceExpiry} label={'* Quoted rates are guaranteed if submitted within:'} onTimerEnd={handleTimerEnd}/></small></span>)
              : null}
            <p><small className='text-muted'>
              {'** Additional fees may apply depending on '
            + 'the asset being sent and the wallet you\'re using.'}
            </small></p>
            {!termsAccepted && (
              <Checkbox
                label={
                  <small className='pl-1 text-white'>I accept the 
                    <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faast Terms & Conditions</a>
                  </small>
                }
                labelClass='p-0'
              />
            )}
          </Body>
          <Footer>
            <div className='w-100 d-flex justify-content-between'>
              <Button type='button' color='primary' outline onClick={handleCancel}>Cancel</Button>
              <Button type='submit' color='primary' disabled={continueDisabled || invalid || submitting}>
                {continueText}
                {continueLoading && (<i className='fa fa-spinner fa-pulse ml-2'/>)}
              </Button>
            </div>
          </Footer>
        </Form>
      </Wrapper>
      <ConfirmTransactionModal swap={currentSwap} handleCancel={handleCancel}/>
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapSubmitModal'),
  setPropTypes({
    modal: PropTypes.bool,
    termsAccepted: PropTypes.bool,
    singleSwap: PropTypes.bool,
  }),
  defaultProps({
    modal: false,
    termsAccepted: false,
    singleSwap: false,
  }),
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
      Trezor.close()
      toggle()
      removeSwundle(swundle)
    },
    handleSignTxs: ({ swundle, signSwundle }) => () => {
      signSwundle(swundle)
        .then(() => Trezor.close())
        .catch((e) => {
          toastr.error(e.message || e)
          log.error(e)
          Trezor.close()
        })
    },
    handleSendTxs: ({ swundle, sendSwundle, toggle, routerPush }) => () => {
      sendSwundle(swundle)
        .then((updatedSwundle) => {
          if (updatedSwundle.swaps.every((swap) => swap.tx.sent)) {
            toggle()
            routerPush(routes.tradeHistory())
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
  withProps(({ swundle, requiresSigning, readyToSign, readyToSend, startedSigning, startedSending, singleSwap }) => {
    let errorMessage = swundle.error
    const soonestPriceExpiry = min(swundle.swaps.map(swap => swap.rateLockedUntil))
    const secondsUntilPriceExpiry = (Date.parse(soonestPriceExpiry) - Date.now()) / 1000
    const currentSwap = swundle.swaps.find(({ txSigning, txSending, sendWallet }) =>
      txSigning || (txSending && sendWallet && !sendWallet.isSignTxSupported))
    const showSubmit = !requiresSigning || startedSigning // True if continue button triggers tx sending, false for signing
    const continueDisabled = showSubmit ? (!readyToSend || startedSending) : (!readyToSign || startedSigning)
    const continueLoading = showSubmit ? startedSending : startedSigning
    const continueText = showSubmit ? (singleSwap ? 'Submit' : 'Submit all') : 'Begin signing'
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

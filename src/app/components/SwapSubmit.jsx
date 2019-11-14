/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col, Button, Alert,
  Modal, ModalHeader, ModalBody, ModalFooter, Form
} from 'reactstrap'
import { reduxForm } from 'redux-form'
import Checkbox from 'Components/Checkbox'
import {
  compose, setDisplayName, setPropTypes, defaultProps,
  withProps, branch, withHandlers, renderNothing, withState
} from 'recompose'
import Trezor from 'Services/Trezor'
import { min } from 'lodash'
import display from 'Utilities/display'
import SwapStatusCard from 'Components/SwapStatusCard'
import Timer from 'Components/Timer'
import Spinner from 'Components/Spinner'
import ConfirmTransactionModal from 'Components/ConfirmTransactionModal'
import T from 'Components/i18n/T'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { toggleOrderModal } from 'Actions/orderModal'
import { refreshSwap } from 'Actions/swap'
import { getGeoLimit } from 'Selectors/app'
import { push } from 'react-router-redux'
import toastr from 'Utilities/toastrWrapper'
import log from 'Utilities/log'
import routes from 'Routes'

import GAEventButton from 'Components/GAEventButton'

const RenderChildren = ({ children }) => children
const RenderNothing = () => null

const SwapSubmit = ({
  isOpen, swaps, headerText, continueText, continueDisabled, continueLoading,
  errorMessage, handleCancel, currentSwap, secondsUntilPriceExpiry, totalTxFee,
  handleTimerEnd, handleSubmit, invalid, submitting, modal, termsAccepted, singleSwap,
  geoLimit, forwardTo, requiresSigning
}) => {
  const Wrapper = modal ? Modal : RenderChildren
  const Header = modal ? ModalHeader : RenderNothing
  const Body = modal ? ModalBody : RenderChildren
  const Footer = modal ? ModalFooter : RenderChildren
  const totalSent = swaps.reduce((a, b) => {
    return !b.sendAmount ? a : b.sendAmount.plus(a)
  }, 0)
  const overGeoLimit = geoLimit && (totalSent > geoLimit.per_transaction.amount)
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
            {overGeoLimit && (
              <Alert color='danger' className='text-center w-100'>
                <T tag='span' i18nKey='app.swapSubmit.geoLimit'>Send amount cannot be greater than ${geoLimit.per_transaction.amount} <a href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>due to your location.</a></T>
              </Alert>
            )}
            {!singleSwap && (
              <T tag='p' i18nKey='app.swapSubmit.multipleSwaps'>
                The following swaps will take place to save the changes you made to your portfolio. Please review them and click "${continueText}" to proceed.
              </T>
            )}
            <div className='my-3'>
              <Row className='gutter-2'>
                {swaps.map((swap) => (
                  <Col xs='12' key={swap.id}>
                    <SwapStatusCard swap={swap} showShortStatus expanded={singleSwap ? true : null}/>
                  </Col>
                ))}
              </Row>
            </div>
            {totalTxFee && (
              <p><T tag='span' i18nKey='app.swapSubmit.networkFee'>Total network fee: </T>{totalTxFee
                ? display.fiat(totalTxFee)
                : <Spinner inline size='sm'/>}
              </p>
            )}
            {(secondsUntilPriceExpiry > 0)
              ? (<span><small><Timer className='text-warning' seconds={secondsUntilPriceExpiry} label={<T tag='span' i18nKey='app.swapSubmit.timer'>* Quoted rates are guaranteed if submitted within:</T>} onTimerEnd={handleTimerEnd}/></small></span>)
              : null}
            <p className={requiresSigning && 'mb-1'}>
              <T tag='small' i18nKey='app.swapSubmit.additionalFees' className='text-muted'>
                ** Additional fees may apply depending on the asset being sent and the wallet you're using.
              </T>
            </p>
            {requiresSigning && (
              <p style={{ color: '#09a99d' }}>
                <small>
                  IMPORTANT: Your swap will be automatically submitted to the network after signing is complete. Please review swap details now.
                </small>
              </p>
            )}
            {!termsAccepted && (
              <div className='mb-3'>
                <Checkbox
                  label={
                    <T tag='small' i18nKey='app.swapSubmit.terms' className='pl-1 text-white'>I accept the 
                      <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faast Terms & Conditions</a>
                    </T>
                  }
                  labelClass='p-0'
                />
              </div>
            )}
          </Body>
          <Footer>
            <div className='w-100 d-flex justify-content-between'>
              <Button type='button' color='primary' outline onClick={handleCancel}><T tag='span' i18nKey='app.swapSubmit.cancel'>Cancel</T></Button>
              <GAEventButton 
                event={forwardTo ? forwardTo.indexOf('/orders/widget') >= 0 && { category: 'Swap', action: 'Submit Swap' } : undefined}
                type='submit' 
                color='primary' 
                disabled={continueDisabled || invalid || submitting || overGeoLimit}
              >
                {continueText}
                {continueLoading && (<i className='fa fa-spinner fa-pulse ml-2'/>)}
              </GAEventButton>
            </div>
          </Footer>
        </Form>
      </Wrapper>
      <ConfirmTransactionModal swap={currentSwap} handleCancel={handleCancel}/>
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapSubmit'),
  setPropTypes({
    swap: PropTypes.oneOfType([
      PropTypes.object,
      PropTypes.arrayOf(PropTypes.object)
    ]),
    requiresSigning: PropTypes.bool.isRequired,
    readyToSign: PropTypes.bool.isRequired,
    readyToSend: PropTypes.bool.isRequired,
    startedSigning: PropTypes.bool.isRequired,
    startedSending: PropTypes.bool.isRequired,
    finishedSending: PropTypes.bool.isRequired,
    onSign: PropTypes.func.isRequired,
    onSend: PropTypes.func.isRequired,
    onCancel: PropTypes.func,
    modal: PropTypes.bool,
    termsAccepted: PropTypes.bool,
    forwardTo: PropTypes.string
  }),
  branch(
    ({ swap }) => !swap,
    renderNothing
  ),
  defaultProps({
    onCancel: () => undefined,
    modal: false,
    termsAccepted: false,
    forwardTo: undefined
  }),
  withState('currentlySending', 'updateCurrentlySending', false),
  connect(createStructuredSelector({
    isOpen: ({ orderModal: { show } }) => show,
    geoLimit: getGeoLimit
  }), {
    toggle: toggleOrderModal,
    routerPush: push,
    refreshSwap,
  }),
  withProps(({ swap, requiresSigning, startedSigning, startedSending, finishedSending, currentlySending }) => {
    let singleSwap = false
    let swaps = swap
    if (!Array.isArray(swap)) {
      singleSwap = true
      swaps = [swap]
    }
    let errorMessage = (swaps.find(({ error }) => error) || {}).error
    const soonestPriceExpiry = min(swaps.map(swap => swap.rateLockedUntil))
    const secondsUntilPriceExpiry = (Date.parse(soonestPriceExpiry) - Date.now()) / 1000
    const currentSwap = swaps.find(({ txSigning, txSending, sendWallet }) =>
      txSigning || (txSending && sendWallet && !sendWallet.isSignTxSupported))
    const continueDisabled = startedSending || startedSigning || finishedSending || currentlySending
    const continueLoading = startedSending || startedSigning || finishedSending || currentlySending
    const continueText = !requiresSigning ? (singleSwap ? <T tag='span' i18nKey='app.swapSubmit.submit'>Submit</T> : <T tag='span' i18nKey='app.swapSubmit.submitAll'>Submit all</T>) : <T tag='span' i18nKey='app.swapSubmit.signAndSubmit'>Sign and Submit</T>
    const headerText = !requiresSigning ? <T tag='span' i18nKey='app.swapSubmit.confirmSubmit'>Confirm and Submit</T> : <T tag='span' i18nKey='app.swapSubmit.reviewSign'>Review and Sign</T>
    return {
      swaps,
      singleSwap,
      errorMessage,
      soonestPriceExpiry,
      secondsUntilPriceExpiry,
      currentSwap,
      continueDisabled,
      continueLoading,
      continueText,
      headerText,
    }
  }),
  withHandlers({
    handleCancel: ({ swap, onCancel, toggle }) => () => {
      onCancel(swap)
      Trezor.cancel()
      toggle()
    },
    handleSignTxs: ({ swap, onSign, updateCurrentlySending }) => () => {
      return Promise.resolve(onSign(swap))
        .catch((e) => {
          updateCurrentlySending(false)
          toastr.error(e.message || e)
          log.error(e)
          Trezor.cancel()
        })
    },
    handleSendTxs: ({ swap, onSend, toggle, routerPush, forwardTo, updateCurrentlySending }) => () => {
      Promise.resolve(onSend(swap))
        .then((updatedSwap) => {
          if (!updatedSwap) {
            return
          }
          if (Array.isArray(updatedSwap) && updatedSwap.every(({ tx }) => tx.sent)) {
            toggle()
            routerPush(routes.tradeHistory())
          } else if (updatedSwap.tx.sent && !forwardTo) {
            toggle()
            routerPush(routes.tradeDetail(updatedSwap.orderId))
          } else if (updatedSwap.tx.sent && forwardTo) {
            toggle()
            routerPush(forwardTo)
          }
        })
        .catch((e) => {
          updateCurrentlySending(false)
          toastr.error(e.message || e)
          log.error(e)
        })
    },
    handleTimerEnd: ({ swaps, refreshSwap }) => () => {
      swaps.map(swap => refreshSwap(swap.orderId))
    },
  }),
  withHandlers({
    handleSignAndSendTxs: ({ handleSignTxs, requiresSigning, handleSendTxs, updateCurrentlySending }) => () => {
      updateCurrentlySending(true)
      !requiresSigning ? handleSendTxs() : handleSignTxs()
        .then(() => handleSendTxs())
        .catch(() => updateCurrentlySending(false))
    },
  }),
  withHandlers({
    onSubmit: ({ handleSignAndSendTxs }) => () => handleSignAndSendTxs(),
  }),
  reduxForm({
    form: 'termsForm'
  })
)(SwapSubmit)

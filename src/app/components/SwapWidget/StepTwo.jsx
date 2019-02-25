import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  compose, setDisplayName, lifecycle, setPropTypes, defaultProps, withHandlers,
  branch, renderComponent,
} from 'recompose'
import { createStructuredSelector } from 'reselect'
import { push as pushAction } from 'react-router-redux'
import classNames from 'class-names'
import { Card } from 'reactstrap'

import { retrieveSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'

import ProgressBar from 'Components/ProgressBar'
import Loading from 'Components/Loading'

import StepTwoManual from './StepTwoManual'
import StepTwoConnected from './StepTwoConnected'

import style from './style'

/* eslint-disable react/jsx-key */
const SwapStepTwo = ({
  swap,
}) => {
  const { sendSymbol, receiveSymbol, isManual } = swap
  return (
    <Fragment>
      <ProgressBar steps={['Create Swap', `Send ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={1}/>
      <Card className={classNames('justify-content-center p-0', style.container, style.stepTwo)}>
        {isManual ? (
          <StepTwoManual swap={swap}/>
        ) : (
          <StepTwoConnected swap={swap}/>
        )}
      </Card>
    </Fragment>
  )
}

const SwapLoading = () => (
  <Loading center/>
)

export default compose(
  setDisplayName('SwapStepTwo'),
  setPropTypes({
    orderId: PropTypes.string,
  }),
  defaultProps({
    orderId: ''
  }),
  connect(createStructuredSelector({
    swap: (state, { orderId }) => getSwap(state, orderId)
  }), {
    retrieveSwap: retrieveSwap,
    push: pushAction,
  }),
  withHandlers({
    checkDepositStatus: ({ push, swap }) => () => {
      swap = swap || {}
      const { orderStatus = '', orderId = '' } = swap
      if (orderStatus && orderStatus !== 'awaiting deposit') {
        push(`/orders/widget/${orderId}`)
      }
    },
  }),
  lifecycle({
    componentWillMount() {
      const { orderId, retrieveSwap, checkDepositStatus } = this.props
      retrieveSwap(orderId)
      checkDepositStatus()
    },
    componentDidUpdate() {
      const { checkDepositStatus } = this.props
      checkDepositStatus()
    }
  }),
  branch(
    ({ swap }) => !swap,
    renderComponent(SwapLoading),
  ),
)(SwapStepTwo)

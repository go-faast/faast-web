import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import {
  compose, setDisplayName, lifecycle, setPropTypes, defaultProps,
  branch, renderComponent,
} from 'recompose'
import { createStructuredSelector } from 'reselect'

import { retrieveSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'

import ProgressBar from 'Components/ProgressBar'
import Loading from 'Components/Loading'

import StepTwoManual from './StepTwoManual'
import StepTwoConnected from './StepTwoConnected'

/* eslint-disable react/jsx-key */
const SwapStepTwo = ({
  swap,
}) => {
  const { sendSymbol, receiveSymbol, isManual } = swap
  return (
    <Fragment>
      <ProgressBar steps={['Create Swap', `Deposit ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={1}/>
      {isManual ? (
        <StepTwoManual swap={swap}/>
      ) : (
        <StepTwoConnected swap={swap}/>
      )}
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
  }),
  branch(
    renderComponent(SwapLoading),
    ({ swap }) => !swap,
  ),
  lifecycle({
    componentWillMount() {
      const { orderId, retrieveSwap } = this.props
      retrieveSwap(orderId)
    }
  })
)(SwapStepTwo)

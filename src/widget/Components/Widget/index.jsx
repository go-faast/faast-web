import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withPropsOnChange } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { isAppBlocked } from 'Selectors'

import Blocked from 'Components/Blocked'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'

const checkStepOne = (swap) => {
  return swap && swap.sendAmount && swap.sendSymbol && swap.receiveAmount && swap.receiveSymbol
}

const checkStepTwo = (swap) => {
  return swap && swap.refundAddress && swap.receiveAddress
}

const SwapWidget = ({ swap }) => {
  return (
    <Fragment>
      {!checkStepOne(swap) && !checkStepTwo(swap) ? (
        <StepOne />
      ) : checkStepOne(swap) && checkStepTwo(swap) ? (
        <StepTwo />
      ) : (
        <StepThree />
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    // swap: getWidgetSwap
  }),{
  }),
)(SwapWidget)

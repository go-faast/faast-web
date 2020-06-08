import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps, withHandlers } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { getSavedSwapWidgetInputs } from 'Selectors/app'

import Blocked from 'Components/Blocked'
import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'

const checkStepOne = (swap) => {
  return swap && swap.toAmount && swap.fromAmount && swap.to && swap.from
}

const checkStepTwo = (swap) => {
  return swap && swap.fromAddress && swap.toAddress
}

const SwapWidget = ({ swapInputs, defaultSendSymbol, defaultReceiveSymbol }) => {
  return (
    <Fragment>
      {!checkStepOne(swapInputs) && !checkStepTwo(swapInputs) ? (
        <StepOne defaultSendSymbol={defaultSendSymbol} defaultReceiveSymbol={defaultReceiveSymbol} />
      ) : checkStepOne(swapInputs) && !checkStepTwo(swapInputs) ? (
        <StepTwo sendSymbol={swapInputs && swapInputs.from ? swapInputs.from : undefined} receiveSymbol={swapInputs && swapInputs.to ? swapInputs.to : undefined } />
      ) : (
        <StepThree />
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    swapInputs: getSavedSwapWidgetInputs
  }),{
  }),
  withHandlers({
    checkQueryParams: () => () => {
      const urlParams = qs.parse(location.search)
      return urlParams
    }
  }),
  withProps(({ checkQueryParams }) => { 
    const { to, from } = checkQueryParams() || {}
    return ({
      defaultSendSymbol: from,
      defaultReceiveSymbol: to
    })}),
)(SwapWidget)

import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps, withHandlers } from 'recompose'
import * as qs from 'query-string'
import { getSavedSwapWidgetInputs } from 'Selectors/widget'
import { getSwap } from 'Selectors/swap'

import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import StepFour from './StepFour'

const checkStepOne = (swap) => {
  return swap && swap.toAmount && swap.fromAmount && swap.to && swap.from
}

const checkStepTwo = (swap) => {
  return swap && swap.fromAddress && swap.toAddress
}

const checkStepThree = (swap) => {
  return swap.orderStatus && swap.orderStatus == 'awaiting deposit'
}

const SwapWidget = ({ swapInputs, swap, defaultSendSymbol, defaultReceiveSymbol }) => {
  return (
    <Fragment>
      {!checkStepOne(swapInputs) && !checkStepTwo(swapInputs) ? (
        <StepOne defaultSendSymbol={defaultSendSymbol} defaultReceiveSymbol={defaultReceiveSymbol} />
      ) : checkStepOne(swapInputs) && !checkStepTwo(swapInputs) ? (
        <StepTwo sendSymbol={swapInputs && swapInputs.from ? swapInputs.from : undefined} receiveSymbol={swapInputs && swapInputs.to ? swapInputs.to : undefined } />
      ) : !checkStepThree(swap) ? (
        <StepThree swap={swap} />
      ) : (
        <StepFour swap={swap} />
      )}
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    swapInputs: getSavedSwapWidgetInputs,
  }),{
  }),
  connect(createStructuredSelector({
    swap: (state, { swapInputs }) => getSwap(state, swapInputs && swapInputs.swap && swapInputs.swap.id)
  }),{
  }),
  withHandlers({
    checkQueryParams: () => () => {
      const urlParams = qs.parse(location.search)
      return urlParams
    },
  }),
  withProps(({ checkQueryParams }) => { 
    const { to, from } = checkQueryParams() || {}
    return ({
      defaultSendSymbol: from,
      defaultReceiveSymbol: to
    })}),
)(SwapWidget)

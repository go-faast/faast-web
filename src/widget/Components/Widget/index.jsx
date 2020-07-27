import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps, withHandlers, lifecycle } from 'recompose'
import * as qs from 'query-string'
import { getSavedSwapWidgetInputs, getCurrentStep } from 'Selectors/widget'
import { getSwap } from 'Common/selectors/swap'

import StepOne from './StepOne'
import StepTwo from './StepTwo'
import StepThree from './StepThree'
import StepFour from './StepFour'
import { localStorageSet } from 'Src/utilities/storage'

const SwapWidget = ({ currentStep, swap, defaultSendSymbol, defaultReceiveSymbol, swapInputs }) => {
  return (
    <Fragment>
      {currentStep == 1 ? (
        <StepOne defaultSendSymbol={defaultSendSymbol} defaultReceiveSymbol={defaultReceiveSymbol} />
      ) : currentStep == 2 ? (
        <StepTwo sendSymbol={swapInputs && swapInputs.from ? swapInputs.from : undefined} receiveSymbol={swapInputs && swapInputs.to ? swapInputs.to : undefined } />
      ) : currentStep == 3 ? (
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
    currentStep: getCurrentStep
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
    const { to, from, affiliateId } = checkQueryParams() || {}
    return ({
      defaultSendSymbol: from,
      defaultReceiveSymbol: to,
      affiliateId
    })}),
  lifecycle({
    componentWillMount() {
      document.body.style.backgroundColor = 'transparent'
    },
    componentDidMount() {
      const { affiliateId } = this.props
      localStorageSet('affiliateId', affiliateId)
    }
  }),
)(SwapWidget)

import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withPropsOnChange } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'
import { isAppBlocked } from 'Selectors'

import Blocked from 'Components/Blocked'
import StepOne from './StepOne'
import StepTwo from './StepTwo'

const SwapWidget = ({ orderId, blocked, stepOne }) => (
  <Fragment>
    {blocked ? (
      <Blocked/>
    ) : null}
    <Layout className='pt-3 p-0 p-sm-3'>
      {!orderId
        ? (<StepOne {...stepOne}/>) 
        : (<StepTwo orderId={orderId} />)}
    </Layout>
  </Fragment>
)

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    blocked: isAppBlocked,
  }),{
  }),
  withRouter,
  withPropsOnChange(['location'], ({ location }) => {
    const urlParams = qs.parse(location.search)
    let { id, from, fromAmount, fromAddress, to, toAmount, toAddress } = urlParams
    fromAmount = fromAmount && Number.parseFloat(fromAmount)
    toAmount = toAmount && Number.parseFloat(toAmount)
    if (fromAmount && toAmount) {
      // Can't set both
      toAmount = undefined
    }
    return {
      orderId: id,
      stepOne: {
        sendSymbol: from,
        receiveSymbol: to,
        defaultSendAmount: fromAmount,
        defaultReceiveAmount: toAmount,
        defaultRefundAddress: fromAddress,
        defaultReceiveAddress: toAddress,
      },
    }
  })
)(SwapWidget)

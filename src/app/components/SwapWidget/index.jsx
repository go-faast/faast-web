import React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'

import StepOne from './StepOne'
import StepTwo from './StepTwo'

const SwapWidget = ({ id, to, from, receive, refund, deposit }) => (
  <Layout className='pt-3 p-0 p-sm-3'>
    {!id ? 
      (<StepOne 
        receiveSymbol={to}
        receiveAddress={receive}
        depositSymbol={from}
        depositAmount={deposit}
        refundAddress={refund}
      />) 
      : <StepTwo orderId={id} />}
  </Layout>
)

export default compose(
  setDisplayName('SwapWidget'),
  withRouter,
  withProps(({ location }) => {
    const urlParams = qs.parse(location.search)
    let { id, to, from, receive, refund, deposit } = urlParams
    deposit = deposit ? parseFloat(deposit) : deposit
    return {
      id,
      to,
      from,
      receive,
      refund,
      deposit
    }
  })
)(SwapWidget)

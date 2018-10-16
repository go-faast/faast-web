import React from 'react'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'

import SwapStepOne from './SwapStepOne'
import SwapStepTwo from './SwapStepTwo'

const SwapWidget = ({ urlParams }) => {
  let { id, to, from, receive, refund, deposit } = urlParams
  deposit = deposit ? parseFloat(deposit) : deposit
  return (
  <Layout className='pt-3'>
  {!id ? 
    (<SwapStepOne 
      receiveSymbol={to} 
      sendSymbol={from} 
      receiveAddr={receive} 
      depositAmount={deposit} 
      refundAddr={refund} 
    />) 
    : <SwapStepTwo orderId={id} />}
  </Layout>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  withRouter,
  withProps(() => {
    const urlParams = qs.parse(location.search)
    return {
      urlParams
    }
  })
)(SwapWidget)

import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'

import { isAppBlocked } from 'Selectors'

import Blocked from 'Components/Blocked'
import SwapStepOne from './SwapStepOne'
import SwapStepTwo from './SwapStepTwo'

const SwapWidget = ({ id, to, from, receive, refund, deposit, blocked }) => (
  <Fragment>
    {blocked ? (
      <Blocked/>
    ) : null}
    <Layout className='pt-3 p-0 p-sm-3'>
      {!id ? 
        (<SwapStepOne 
          receiveSymbol={to}
          receiveAddress={receive}
          depositSymbol={from}
          depositAmount={deposit}
          refundAddress={refund}
        />) 
        : <SwapStepTwo orderId={id} />}
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

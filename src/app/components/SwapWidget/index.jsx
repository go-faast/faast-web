import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { Helmet } from 'react-helmet'
import { createStructuredSelector } from 'reselect'
import { isDefaultPortfolioEmpty } from 'Selectors/portfolio'
import { compose, setDisplayName, withHandlers, withPropsOnChange, withState } from 'recompose'
import { Row, Col } from 'reactstrap'
import Layout from 'Components/Layout'
import * as qs from 'query-string'
import { withRouter } from 'react-router'
import { isAppBlocked } from 'Selectors'
import Link from 'Components/Link'

import Blocked from 'Components/Blocked'
import ShutDown from 'Components/ShutDown'
import StepOne from './StepOne'
import StepTwo from './StepTwo'

const SwapWidget = ({ orderId, blocked, stepOne, isDefaultPortfolioEmpty, toggleShutDownModal,
  showShutDownMessage }) => (
  <Fragment>
    <Helmet>
      <title>Instantly and Safely Trade 70+ Cryptocurrencies - Faa.st</title>
      <meta name='description' content='Trade your crypto directly from your hardware or software wallet. Swap Bitcoin, Ethereum, Litecoin, Monero, Tron, and more with near-zero fees.' /> 
    </Helmet>
    {showShutDownMessage && (
      <ShutDown handleCloseModal={toggleShutDownModal} />
    )}
    {blocked ? (
      <Blocked/>
    ) : null}
    <Layout className='pt-3 p-0 p-sm-3'>
      <Row 
        tag={'div'}
        onClick={toggleShutDownModal}
        className='px-3 py-2 mb-3 mx-0 custom-hover cursor-pointer text-center' 
        style={{ background: 'linear-gradient(45deg, #e0b01f 0%, #b88e11 100%)', borderRadius: 2, }}>
        <Col>
          <span className='text-white text-center'>On June 7th Faa.st will be shutting down its swapping service. Click for more details.</span>
        </Col>
      </Row>
      {!orderId
        ? (<StepOne {...stepOne}/>) 
        : (<StepTwo orderId={orderId} />)}
      {!isDefaultPortfolioEmpty && (
        <div className='text-center mt-3 font-sm'>
          <Link to='/rebalance'>Want to swap multiple coins at once? Use our rebalance tool.</Link>
        </div>
      )}
    </Layout>
  </Fragment>
)

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    blocked: isAppBlocked,
    isDefaultPortfolioEmpty,
  }),{
  }),
  withRouter,
  withState('showShutDownMessage', 'updateShowShutDownMessage', false),
  withHandlers({
    toggleShutDownModal: ({ showShutDownMessage, updateShowShutDownMessage }) => () => {
      updateShowShutDownMessage(!showShutDownMessage)
    }
  }),
  withPropsOnChange(['location'], ({ location }) => {
    const urlParams = qs.parse(location.search)
    let { id, from, fromAmount, fromAddress, to, toAmount, toAddress } = urlParams
    fromAmount = fromAmount && parseFloat(fromAmount)
    toAmount = toAmount && parseFloat(toAmount)
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

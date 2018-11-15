import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle, setPropTypes, defaultProps, withHandlers, withProps } from 'recompose'
import { Button, Input, Col, Row, Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import classNames from 'class-names'
import { createStructuredSelector } from 'reselect'
import QRCode from 'qrcode.react'

import routes from 'Routes'
import toastr from 'Utilities/toastrWrapper'

import Rate from 'Components/Rate'
import Timer from 'Components/Timer'
import Expandable from 'Components/Expandable'
import ProgressBar from 'Components/ProgressBar'
import Units from 'Components/Units'
import { retrievePairData } from 'Actions/rate'
import { retrieveSwap, refreshSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'
import { getRateMinimumDeposit, getRatePrice } from 'Selectors/rate'
import DataLayout from 'Components/DataLayout'

import { container, qr, scan, receipt } from './style.scss'

/* eslint-disable react/jsx-key */
const SwapStepTwo = ({
  swap, handleRef, handleFocus, handleCopy, handleTimerEnd, secondsUntilPriceExpiry, 
  minimumDeposit, estimatedRate
}) => {
  swap = swap || {}
  let {
    orderId = '', sendSymbol = '', depositAddress = '', receiveSymbol = '', receiveAddress = '',
    sendAmount, receiveAmount, rate, orderStatus = '', refundAddress = '', isFixedPrice,
    sendAsset: { bip21Prefix }
  } = swap
  const quotedRate = rate || estimatedRate
  const qrAddress = bip21Prefix && depositAddress.indexOf(bip21Prefix) < 0 
    ? `${bip21Prefix}:${depositAddress}` : depositAddress
  const qrQueryString = !sendAmount || bip21Prefix === 'ethereum' ? qrAddress : `${qrAddress}?amount=${sendAmount}`
  return (
    <Fragment>
      <ProgressBar steps={['Create Swap', `Deposit ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={1}/>
      <Card className={classNames('container justify-content-center p-0', container)}>
        <CardHeader className='text-center'>
          <h4>
            Send {(sendAmount && sendAmount > 0)
            ? (<Units value={sendAmount} symbol={sendSymbol} precision={8} showIcon/>)
            : (minimumDeposit ? (
              <Fragment>at least <Units value={minimumDeposit} symbol={sendSymbol} precision={8} showIcon/></Fragment>
            ) : null)} to address:
          </h4>
        </CardHeader>

        <CardBody className='pt-1 text-center'>
          <div className={classNames('mt-3', qr)}>
            <div className={scan}></div>
            <QRCode size={150} level='L' value={qrQueryString}/>
          </div>
          <Row className='gutter-2 my-2'>
            <Col>
              <Input type='text' autoFocus readOnly onFocus={handleFocus} innerRef={handleRef} value={depositAddress}/>
            </Col>
            <Col xs='auto'>
              <Button color='link' className='p-2' onClick={handleCopy}><i className='fa fa-copy'/></Button>
            </Col>
          </Row>
        </CardBody>
        <CardFooter style={{ border: 'none', position: 'relative', wordBreak: 'break-word' }}>
          <div className={receipt}></div>
          <p className='mt-2 text-center' style={{ letterSpacing: 5 }}>ORDER DETAILS</p>
          <DataLayout rows={[
            ['Status:', <span className='text-capitalize'>
              {orderStatus} {orderStatus !== 'complete' && (
                <Expandable
                  shrunk={<i className='fa fa-spinner fa-pulse'/>}
                  expanded={'Order status is updated automatically. You do not need to refresh.'}/>
              )}
            </span>],
            ['Order ID:', <span className='text-monospace'>{orderId}</span>],
            ['Receive address:', <span className='text-monospace'>{receiveAddress}</span>],
            refundAddress && ['RefundAddress:', <span className='text-monospace'>{refundAddress}</span>],
            quotedRate && ['Rate:', <Rate rate={quotedRate} from={sendSymbol} to={receiveSymbol}/>],
            sendAmount
              ? ['Deposit amount:', <Units value={sendAmount} symbol={sendSymbol} precision={8}/>]
              : (minimumDeposit && ['Minimum deposit:', <Units value={minimumDeposit} symbol={sendSymbol} precision={8}/>]),
            receiveAmount && ['Receive amount:', <Units value={receiveAmount} symbol={receiveSymbol} precision={8}/>]
          ]}/>
          <div className='mt-2'>
            <small className='text-muted'>
              {!isFixedPrice ? (
                '* Quoted rate is an estimate based on current market conditions. Actual rate may vary.'
              ) : (secondsUntilPriceExpiry > 0 && (
                  <Timer className='text-warning' seconds={secondsUntilPriceExpiry}
                    label={'* Quoted rate is guaranteed if deposit is sent within:'}
                    onTimerEnd={handleTimerEnd}/>
              ))}
            </small>
          </div>
        </CardFooter>
      </Card>
    </Fragment>
  )
}

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
    push: pushAction,
    refreshSwap,
    retrievePairData: retrievePairData,
  }),
  withProps(({ swap = {} }) => {
    const { rateLockedUntil } = swap
    const secondsUntilPriceExpiry = (Date.parse(rateLockedUntil) - Date.now()) / 1000
    return {
      secondsUntilPriceExpiry,
      pair: swap.pair,
    }
  }),
  connect(createStructuredSelector({
    minimumDeposit: (state, { pair }) => getRateMinimumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
  })),
  withHandlers(() => {
    let inputRef
    return {
      handleRef: () => (ref) => {
        inputRef = ref
      },
      handleFocus: () => (event) => {
        event.target.select()
      },
      handleCopy: () => () => {
        inputRef.select()
        document.execCommand('copy')
        toastr.info('Address copied to clipboard')
      },
      checkDepositStatus: ({ push, swap }) => () => {
        swap = swap || {}
        const { orderStatus = '', orderId = '' } = swap
        if (orderStatus && orderStatus !== 'awaiting deposit') {
          push(routes.tradeDetail(orderId))
        }
      },
      handleTimerEnd: ({ refreshSwap, swap }) => () => {
        refreshSwap(swap.orderId)
      }
    }
  }),
  lifecycle({
    componentDidUpdate() {
      const { minimumDeposit, pair, checkDepositStatus, retrievePairData } = this.props
      if (pair && !minimumDeposit) {
        retrievePairData(pair)
      }
      checkDepositStatus()
    },
    componentWillMount() {
      const { orderId, swap, checkDepositStatus, retrieveSwap, retrievePairData } = this.props
      if (!swap) {
        retrieveSwap(orderId)
      } else {
        retrieveSwap(orderId)
        checkDepositStatus()
        retrievePairData(swap.pair)
      }
    }
  })
)(SwapStepTwo)

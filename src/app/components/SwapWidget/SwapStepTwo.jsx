import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle, setPropTypes, defaultProps, withHandlers, withStateHandlers, withProps } from 'recompose'
import classNames from 'class-names'
import { createStructuredSelector } from 'reselect'
import routes from 'Routes'
import Units from 'Components/Units'
import Timer from 'Components/Timer'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'
import ProgressBar from 'Components/ProgressBar'
import { Button, Input, Col, Row, Card, CardHeader, CardBody, CardFooter } from 'reactstrap'
import { container, qr, scan, receipt } from './style.scss'
import QRCode from 'qrcode.react'
import toastr from 'Utilities/toastrWrapper'
import { retrieveSwap, refreshSwap } from 'Actions/swap'
import { getSwap } from 'Selectors/swap'
import PropTypes from 'prop-types'

const SwapStepTwo = ({ swap, handleRef, handleFocus, handleCopy, timerExpired, handleTimerEnd, secondsUntilPriceExpiry }) => {
  swap = swap ? swap : {}
  const { orderId = '', sendSymbol = '', depositAddress = '', receiveSymbol = '', receiveAddress = '',
  sendAmount = '', receiveAmount = '', inverseRate = '', orderStatus = '', refundAddress = '' } = swap
  return (
    <Fragment>
        <ProgressBar steps={['Create Swap', `Deposit ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={1}/>
        <Card className={classNames('container justify-content-center p-0', container)}>
        <CardHeader className='text-center'>
            <h4> Send 
           <CoinIcon key={sendSymbol} symbol={sendSymbol} size='sm' className='ml-2 mr-1 mb-1' inline/> 
           {sendAmount > 0 ? sendAmount : null} {sendSymbol} to Address:</h4>
        </CardHeader>
        <CardBody className='pt-1 text-center'>
        
         <div className={classNames('mt-3', qr)}>
           <div className={scan}></div>
           <QRCode size={150} level='L' value={depositAddress}/>
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
          <table style={{ lineHeight: 1.25, textAlign: 'left' }}>
            <tbody>
              <tr>
                <td><b>Status:</b></td>
                <td colSpan='2' className='px-2' style={{ textTransform: 'capitalize' }}>
                  {orderStatus} {orderStatus !== 'complete' && (<Expandable shrunk={<i className='fa fa-spinner fa-pulse'/>} expanded={'Order status is updated automatically. You do not need to refresh.'}></Expandable>)}
                </td>
              </tr>
              <tr>
                <td><b>Order ID:</b></td>
                <td colSpan='2' className='px-2'>{orderId}</td>
              </tr>
              <tr>
                <td><b>Receive Address:</b></td>
                <td colSpan='2' className='px-2'>{receiveAddress}</td>
              </tr>
              {refundAddress ? (
              <tr>
                <td><b>Refund Address:</b></td>
                <td colSpan='2' className='px-2'>{refundAddress}</td>
              </tr>
              ) : null}
              <tr>
                <td><b>Rate:</b></td>
                <td colSpan='2' className='px-2'>
                  {isFinite(inverseRate) ?
                  <span>1 {sendSymbol} = <Units value={inverseRate} precision={6}/> {receiveSymbol}</span> :
                    'Order will be fulfilled at the current market rate'}
                </td>
              </tr>
              {(sendAmount && sendAmount > 0) ? (
              <tr>
                <td><b>Deposit Amount:</b></td>
                <td colSpan='2' className='px-2'>{sendAmount} {sendSymbol}</td>
              </tr>
              ) : null}
              {(receiveAmount && receiveAmount > 0) ? (
              <tr>
                <td><b>Receive Amount:</b></td>
                <td colSpan='2' className='px-2'>{receiveAmount} {receiveSymbol}</td>
              </tr>
              ) : null}
            </tbody>
          </table>
          {(secondsUntilPriceExpiry > 0 && !timerExpired)
          ? (<span><small><Timer className='text-warning' seconds={secondsUntilPriceExpiry} label={'* Quoted rates are guaranteed if deposit sent within:'} onTimerEnd={handleTimerEnd}/></small></span>)
          : (timerExpired && (<span className='text-warning'><small>* Quoted rates are no longer guaranteed as the 15 minute guarantee window has expired. Orders will be filled using the latest variable rate when deposit is received.</small></span>))}
        </CardFooter>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapStepTwo'),
  connect(createStructuredSelector({
    swap: (state, { orderId }) => getSwap(state, orderId)
  }), {
    retrieveSwap: retrieveSwap,
    push: pushAction,
    refreshSwap
  }),
  setPropTypes({
    orderId: PropTypes.string,
  }),
  defaultProps({
    orderId: ''
  }),
  withProps(({ swap = {} }) => {
    const { rateLockedUntil } = swap
    const secondsUntilPriceExpiry = (Date.parse(rateLockedUntil) - Date.now()) / 1000
    return {
      secondsUntilPriceExpiry,
    }
  }),
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
        console.log('in handle timer end')
        refreshSwap(swap.orderId)
      }
    }
  }),
  lifecycle({
    componentDidUpdate() {
      const { checkDepositStatus } = this.props
      checkDepositStatus()
    },
    componentWillMount() {
      const { orderId, swap, checkDepositStatus, retrieveSwap } = this.props
      if (!swap) {
        retrieveSwap(orderId)
      } else {
        retrieveSwap(orderId)
        checkDepositStatus()
      }
    }
  }),
  withStateHandlers(
    { timerExpired: false },
    // { handleTimerEnd: () => () => ({ timerExpired: true }) },
  ),
)(SwapStepTwo)

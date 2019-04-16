import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { compose, setDisplayName, lifecycle, setPropTypes, withHandlers, withProps } from 'recompose'
import { CardHeader, CardBody, CardFooter, Alert } from 'reactstrap'

import routes from 'Routes'

import conditionalRedirect from 'Hoc/conditionalRedirect'
import DepositQRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import Rate from 'Components/Rate'
import Timer from 'Components/Timer'
import Expandable from 'Components/Expandable'
import Units from 'Components/Units'
import { retrievePairData } from 'Actions/rate'
import { refreshSwap } from 'Actions/swap'
import { getRateMinimumDeposit, getRatePrice, getRateMaximumDeposit } from 'Selectors/rate'
import DataLayout from 'Components/DataLayout'

import { getGeoLimit } from 'Selectors/app'

import style from './style.scss'

/* eslint-disable react/jsx-key */
const StepTwoManual = ({
  handleTimerEnd, secondsUntilPriceExpiry, minimumDeposit, maxiumumDeposit, quotedRate, maxGeoBuy,
  swap: {
    orderId = '', sendSymbol = '', depositAddress = '', receiveSymbol = '', receiveAddress = '',
    sendAmount, receiveAmount, orderStatus = '', refundAddress = '', isFixedPrice, sendAsset,
  },
}) => (
  <Fragment>
    <CardHeader className='text-center'>
      <h4>
        Send {(sendAmount && sendAmount > 0)
          ? (<Units value={sendAmount} symbol={sendSymbol} precision={8} showIcon/>)
          : (minimumDeposit ? (
            <Fragment>at least <Units value={minimumDeposit} symbol={sendSymbol} precision={8} showIcon/>
            </Fragment>
          ) : null)} to address:
      </h4>
    </CardHeader>
    <CardBody className='pt-1 text-center'>
      <DepositQRCode className='mt-3' scan size={150} address={depositAddress} asset={sendAsset} amount={sendAmount}/>
      <ClipboardCopyField value={depositAddress}/>
      {maxGeoBuy && (
        <Alert color='info' className='mx-auto mt-3 text-center'>
          <small>Please note: The maximum you can swap is <Units precision={8} roundingType='dp' value={maxGeoBuy}/> {sendSymbol} <a style={{ color: 'rgba(0, 255, 222, 1)' }} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noreferrer noopener'>due to your location.</a></small>
        </Alert>
      )}
    </CardBody>
    <CardFooter style={{ border: 'none', position: 'relative', wordBreak: 'break-word' }}>
      <div className={style.receipt}></div>
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
        !sendAmount && (maxiumumDeposit && ['Maximum deposit:', <Units value={maxiumumDeposit} symbol={sendSymbol} precision={8}/>]),
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
  </Fragment>
)

export default compose(
  setDisplayName('StepTwoManual'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  conditionalRedirect(
    routes.swapWidget(),
    ({ swap }) => !swap,
  ),
  connect((state, { swap: { pair } }) => ({
    minimumDeposit: getRateMinimumDeposit(state, pair),
    maxiumumDeposit: getRateMaximumDeposit(state,pair),
    estimatedRate: getRatePrice(state, pair),
    limit: getGeoLimit(state),
  }), {
    push: pushAction,
    refreshSwap,
    retrievePairData: retrievePairData,
  }),
  withProps(({ swap: { rateLockedUntil, rate, sendAsset }, estimatedRate, limit }) => {
    const maxGeoBuy = limit ? limit.per_transaction.amount / parseFloat(sendAsset.price) : null
    return ({
      secondsUntilPriceExpiry: (Date.parse(rateLockedUntil) - Date.now()) / 1000,
      quotedRate: rate || estimatedRate,
      maxGeoBuy
    })
  }),
  withHandlers({
    handleTimerEnd: ({ refreshSwap, swap }) => () => {
      refreshSwap(swap.orderId)
    },
  }),
  lifecycle({
    componentDidUpdate() {
      const { swap, minimumDeposit, retrievePairData } = this.props
      if (!minimumDeposit) {
        retrievePairData(swap.pair)
      }
    },
    componentWillMount() {
      const { swap, retrievePairData } = this.props
      retrievePairData(swap.pair)
    }
  }),
)(StepTwoManual)

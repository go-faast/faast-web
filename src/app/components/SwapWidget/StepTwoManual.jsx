/* eslint-disable react/no-unescaped-entities */
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
import T from 'Components/i18n/T'
import extraAssetFields from 'Src/config/extraAssetFields'
import { capitalizeFirstLetter } from 'Utilities/helpers'

import { getGeoLimit } from 'Selectors/app'
import { getSwap } from 'Selectors/swap'

import style from './style.scss'

/* eslint-disable react/jsx-key */
const StepTwoManual = ({
  handleTimerEnd, secondsUntilPriceExpiry, minimumDeposit, maxiumumDeposit, quotedRate, maxGeoBuy,
  swap: {
    orderId = '', sendSymbol = '', depositAddress = '', receiveSymbol = '', receiveAddress = '',
    sendAmount, receiveAmount, orderStatus = '', refundAddress = '', isFixedPrice, sendAsset, 
    depositAddressExtraId, withdrawalAddressExtraId, refundAddressExtraId,
  },
}) => {
  const depositFieldName = extraAssetFields[sendSymbol] && extraAssetFields[sendSymbol].deposit
  return (
    <Fragment>
      <CardHeader className='text-center'>
        <h4>
          <T tag='span' i18nKey='app.stepTwoManual.send'>Send</T> {(sendAmount && sendAmount > 0)
            ? (<Units value={sendAmount} symbol={sendSymbol} precision={8} showIcon/>)
            : (minimumDeposit ? (
              <Fragment><T tag='span' i18nKey='app.stepTwoManual.atLeast'>at least</T> <Units value={minimumDeposit} symbol={sendSymbol} precision={8} showIcon/>
              </Fragment>
            ) : null)} <T tag='span' i18nKey='app.stepTwoManual.toAddres'>to address{depositAddressExtraId && <span> with {depositFieldName}</span>}:</T>
        </h4>
      </CardHeader>
      <CardBody className='pt-1 text-center'>
        <DepositQRCode 
          className='mt-3' 
          scan 
          size={150} 
          depositTag={depositAddressExtraId}
          address={depositAddress} 
          asset={sendAsset} 
          amount={sendAmount}
        />
        {depositAddressExtraId && (
          <div className='text-left mt-3'>
            <span>Send address:</span>
          </div>
        )}
        <ClipboardCopyField value={depositAddress}/>
        {depositAddressExtraId && (
          <div className='text-left'>
            <span>{capitalizeFirstLetter(depositFieldName)}:</span>
            <ClipboardCopyField value={depositAddressExtraId}/>
            <Alert color='warning' className='mx-auto mt-3 text-center'>
            Important: You must send {sendSymbol} to the address with the above {depositFieldName}. If you don't include a {depositFieldName} we won't be able to process your swap.
            </Alert>
          </div>
        )}
        {maxGeoBuy && (
          <Alert color='info' className='mx-auto mt-3 text-center'>
            <T tag='small' i18nKey='app.stepTwoManual.geoLimit'>Please note: The maximum you can swap is <Units precision={8} roundingType='dp' value={maxGeoBuy}/> {sendSymbol} <a style={{ color: 'rgba(0, 255, 222, 1)' }} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noreferrer noopener'>due to your location.</a></T>
          </Alert>
        )}
      </CardBody>
      <CardFooter style={{ border: 'none', position: 'relative', wordBreak: 'break-word' }}>
        <div className={style.receipt}></div>
        <T tag='p' i18nKey='app.stepTwoManual.orderDetails' className='mt-2 text-center' style={{ letterSpacing: 5 }}>ORDER DETAILS</T>
        <DataLayout rows={[
          [<T tag='span' i18nKey='app.stepTwoManual.status'>Status:</T>, <span className='text-capitalize'>
            {orderStatus} {orderStatus !== 'complete' && (
              <Expandable
                shrunk={<i className='fa fa-spinner fa-pulse'/>}
                expanded={<T tag='span' i18nKey='app.stepTwoManual.autoUpdates'>Order status is updated automatically. You do not need to refresh.</T>}/>
            )}
          </span>],
          [<T tag='span' i18nKey='app.stepTwoManual.orderID'>Order ID:</T>, <span className='text-monospace'>{orderId}</span>],
          [
            <T tag='span' i18nKey='app.stepTwoManual.receiveAddress'>Receive address:</T>,
            <span className='text-monospace'>
              {receiveAddress} {withdrawalAddressExtraId && (
                `(${withdrawalAddressExtraId})`
              )}
            </span>
          ],
          refundAddress && [
            <T tag='span' i18nKey='app.stepTwoManual.refundAddress'>Refund address:</T>,
            <span className='text-monospace'>
              {refundAddress} {refundAddressExtraId && (
                `(${refundAddressExtraId})`
              )}
            </span>
          ],
          quotedRate && [<T tag='span' i18nKey='app.stepTwoManual.rate'>Rate:</T>, <Rate rate={quotedRate} from={sendSymbol} to={receiveSymbol}/>],
          sendAmount
            ? [<T tag='span' i18nKey='app.stepTwoManual.depositAmount'>Send amount:</T>, <Units value={sendAmount} symbol={sendSymbol} precision={8}/>]
            : (minimumDeposit && [<T tag='span' i18nKey='app.stepTwoManual.minimumAmount'>Send minimum:</T>, <Units value={minimumDeposit} symbol={sendSymbol} precision={8}/>]),
          !sendAmount && (maxiumumDeposit && [<T tag='span' i18nKey='app.stepTwoManual.maximumAmount'>Send maximum:</T>, <Units value={maxiumumDeposit} symbol={sendSymbol} precision={8}/>]),
          receiveAmount && [<T tag='span' i18nKey='app.stepTwoManual.receiveAmount'>Receive amount:</T>, <Units value={receiveAmount} symbol={receiveSymbol} precision={8}/>]
        ]}/>
        <div className='mt-2'>
          <small className='text-muted'>
            {!isFixedPrice ? (
              <T tag='span' i18nKey='app.stepTwoManual.fixedPrice'>* Quoted rate is an estimate based on current market conditions. Actual rate may vary.</T>
            ) : (secondsUntilPriceExpiry > 0 && (
              <Timer className='text-warning' seconds={secondsUntilPriceExpiry}
                label={ <T tag='span' i18nKey='app.stepTwoManual.quotedRate'>* Quoted rate is guaranteed if funds are sent within:</T>}
                onTimerEnd={handleTimerEnd}/>
            ))}
          </small>
        </div>
      </CardFooter>
    </Fragment>
  )
}

export default compose(
  setDisplayName('StepTwoManual'),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
  conditionalRedirect(
    routes.swapWidget(),
    ({ swap }) => !swap,
  ),
  connect((state, { swap: { pair, id } }) => ({
    minimumDeposit: getRateMinimumDeposit(state, pair),
    maxiumumDeposit: getRateMaximumDeposit(state,pair),
    estimatedRate: getRatePrice(state, pair),
    limit: getGeoLimit(state),
    currentSwap: getSwap(state, id),
  }), {
    push: pushAction,
    refreshSwap,
    retrievePairData: retrievePairData,
  }),
  withProps(({ swap: { rateLockedUntil, rate, sendAsset }, estimatedRate, swap, limit, currentSwap }) => {
    const maxGeoBuy = limit ? limit.per_transaction.amount / parseFloat(sendAsset.price) : null
    return ({
      secondsUntilPriceExpiry: (Date.parse(rateLockedUntil) - Date.now()) / 1000,
      quotedRate: rate || estimatedRate,
      maxGeoBuy,
      swap: currentSwap ? currentSwap : swap
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

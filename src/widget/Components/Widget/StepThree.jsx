/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withHandlers, setPropTypes, lifecycle } from 'recompose'
import classNames from 'class-names'
import { push as pushAction } from 'react-router-redux'
import { Card, CardHeader, CardBody, Alert } from 'reactstrap'
import { getSwap } from 'Common/selectors/swap'
import DepositQRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import Expandable from 'Components/Expandable'
import { refreshSwap } from 'Common/actions/swap'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import { retrievePairData } from 'Common/actions/rate'
import Timer from 'Components/Timer'

import { getRateMinimumDeposit, getRatePrice, getRateMaximumDeposit, } from 'Common/selectors/rate'
import { getGeoLimit } from 'Common/selectors/app'

import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import extraAssetFields from 'Src/config/extraAssetFields'
import ProgressBar from '../ProgressBar'

import style from './style.scss'


const StepThree = ({ swap: { orderId, receiveSymbol, depositAddressExtraId, depositAddress, sendAsset, 
  sendAmount, sendSymbol, maxGeoBuy, isFixedPrice, orderStatus }, minimumDeposit, handleTimerEnd, secondsUntilPriceExpiry }) => {
  const depositFieldName = extraAssetFields[sendSymbol] && extraAssetFields[sendSymbol].deposit
  return (
    <Fragment>
      <Card className={classNames('justify-content-center p-0 m-0', style.container, style.stepOne)}>
        <CardHeader style={{ backgroundColor: '#394045' }} className='text-center border-0'>
          <T tag='h4' i18nKey='app.widget.swapInstantly' className='my-1'>Swap Instantly</T>
        </CardHeader>
        <CardBody className='pt-3 text-center'>
          <ProgressBar 
            steps={[
              { 
                text: 'Choose Assets',
              },
              {
                text: 'Input Addresses'
              },
              {
                text: `Send ${sendSymbol}`
              },
              {
                text: `Receive ${receiveSymbol}`
              }
            ]} 
            currentStep={2}
          />
          <h4 className='mt-4'>
            <T tag='span' className='text-dark' i18nKey='app.stepTwoManual.send'>Send</T> {(sendAmount && sendAmount > 0)
              ? (<Units className='text-dark' value={sendAmount} symbol={sendSymbol} precision={8} showIcon/>)
              : (minimumDeposit ? (
                <Fragment><T tag='span' className='text-dark' i18nKey='app.stepTwoManual.atLeast'>at least</T> <Units className='text-dark' value={minimumDeposit} symbol={sendSymbol} precision={8} showIcon/>
                </Fragment>
              ) : null)} <T className='text-dark' tag='span' i18nKey='app.stepTwoManual.toAddres'>to address{depositAddressExtraId && <span> with {depositFieldName}</span>}:</T>
          </h4>
          <span className='text-dark d-inline-block' style={{ fontSize: 14 }}>
            [ <Expandable
              shrunk={<i className='fa fa-spinner fa-pulse mr-1'/>}
              expanded={<span>Order status is updated automatically. Please do not refresh.</span>}/> 
            {orderStatus} ]
          </span>
          <div className='text-center'>
            <DepositQRCode 
              className='mt-1' 
              scan={false}
              size={120} 
              depositTag={depositAddressExtraId}
              address={depositAddress} 
              asset={sendAsset} 
              amount={sendAmount}
            />
          </div>
          {depositAddressExtraId && (
            <div className='text-left mt-3'>
              <span>Send address:</span>
            </div>
          )}
          <ClipboardCopyField 
            className={classNames('flat', style.customInput)}
            value={depositAddress}
          />
          {depositAddressExtraId && (
            <div className='text-left'>
              <span>{capitalizeFirstLetter(depositFieldName)}:</span>
              <ClipboardCopyField 
                className={classNames('flat', style.customInput)}
                value={depositAddressExtraId}
              />
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
          <div className='mt-2'>
            <small className='text-muted'>
              {!isFixedPrice ? (
                <T tag='span' i18nKey='app.stepTwoManual.fixedPrice'>* Quoted rate is an estimate based on current market conditions. Actual rate may vary.</T>
              ) : (secondsUntilPriceExpiry > 0 && (
                <Timer style={{ color: '#8392ac' }} seconds={secondsUntilPriceExpiry}
                  label={ <T tag='span' i18nKey='app.stepTwoManual.quotedRate'>* Quoted rate is guaranteed if funds are sent within:</T>}
                  onTimerEnd={handleTimerEnd}/>
              ))}
            </small>
            <small className='d-block' style={{ color: '#8392ac' }}>
              ** Your swap ID is <a href={`https://faa.st/app/orders/${orderId}`} target='_blank noreferrer'>{orderId}</a>
            </small>
          </div>
        </CardBody>
        <div style={{ color: '#B5BCC4' }} className='text-center font-xs mb-3'>
          <span>powered by <a href='https://faa.st' target='_blank noreferrer'>Faa.st</a></span>
        </div>
      </Card>
    </Fragment>
  )}

export default compose(
  setDisplayName('StepThree'),
  withTranslation(),
  setPropTypes({
    swap: PropTypes.object.isRequired,
  }),
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
      swap: currentSwap ? currentSwap : swap,
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
)(StepThree)

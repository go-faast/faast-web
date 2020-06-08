import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody, Alert } from 'reactstrap'
import { getSwap } from 'Selectors/swap'
import DepositQRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import { toBigNumber } from 'Utilities/convert'
import { refreshSwap } from 'Actions/swap'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import * as qs from 'query-string'
import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'
import { saveSwapWidgetInputs } from 'Actions/app'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumWithdrawal,
  getRateMaximumDeposit, rateError, isRateStale, getRateMinimumWithdrawal } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit, getSavedSwapWidgetInputs } from 'Selectors/app'
import extraAssetFields from 'Config/extraAssetFields'

import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import debounceHandler from 'Hoc/debounceHandler'

import ProgressBar from '../ProgressBar'

import style from './style.scss'
import Faast from 'Src/services/Faast'


const StepThree = ({ receiveSymbol, depositAddressExtraId, depositAddress, sendAsset, sendAmount,
  depositFieldName, sendSymbol, maxGeoBuy }) => {
  return (
    <Fragment>
      <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
        <CardHeader style={{ backgroundColor: '#394045' }} className='text-center border-0'>
          <T tag='h4' i18nKey='app.widget.swapInstantly' className='my-1'>Swap Instantly</T>
        </CardHeader>
        <CardBody className='pt-3'>
          <ProgressBar 
            steps={[
              { 
                text: 'Choose Assets',
              },
              {
                text: 'Input Addresses'
              },
              {
                text: `Receive ${receiveSymbol}`
              }
            ]} 
            currentStep={2}
          />
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
        <div style={{ color: '#B5BCC4' }} className='text-center font-xs mb-3'>
          <span>powered by Faa.st</span>
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
)(StepThree)

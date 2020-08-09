import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, 
  setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector } from 'redux-form'
import { createStructuredSelector } from 'reselect'
import {
  Form, Button, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText, Alert
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import * as qs from 'query-string'
import { retrievePairData } from 'Common/actions/rate'
import { saveSwapWidgetInputs } from 'Actions/widget'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumWithdrawal,
  getRateMaximumDeposit, rateError, isRateStale, getRateMinimumWithdrawal } from 'Common/selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Common/selectors/asset'
import { getGeoLimit } from 'Common/selectors/app'
import { getSavedSwapWidgetInputs } from 'Selectors/widget'
import { isAppBlocked } from 'Common/selectors/app'
import Overlay from 'Components/Overlay'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelectorList'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import ProgressBar from '../ProgressBar'
import SwapIcon from 'Img/swap-icon.svg?inline'
import FaastLogo from 'Img/faast-logo.png'

import style from './style.scss'

const DEFAULT_SEND_SYMBOL = 'BTC'
const DEFAULT_RECEIVE_SYMBOL = 'ETH'
const DEFAULT_SEND_AMOUNT = 1
const FORM_NAME = 'swapWidget'

const getFormValue = formValueSelector(FORM_NAME)

const StepOneField = withProps(({ labelClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass, style.customLabel),
  inputClass: classNames('flat', style.customInput),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', className: 'text-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapStepOne = ({
  sendSymbol, receiveSymbol, assetSymbols, assetSelect, setAssetSelect, validateSendAmount, validateReceiveAmount,
  handleSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, isAppBlocked,
  onChangeSendAmount, maxGeoBuy, handleSelectGeoMax, onChangeReceiveAmount, estimatedField,
  sendAmount, receiveAmount, rateError, sendAsset, t, onCloseAssetSelector, isSubmittingSwap
}) => {
  return (
    <Fragment>
      {maxGeoBuy && (
        <Alert color='info' className='mx-auto mt-3 w-75 text-center'>
          <small>
            <T tag='span' i18nKey='app.widget.pleaseNote'>Please note: The maximum you can swap is </T> 
            <Button style={{ color: 'rgba(0, 255, 222, 1)' }} color='link-plain' onClick={handleSelectGeoMax}>
              <Units precision={sendAsset.decimals} roundingType='dp' value={maxGeoBuy} />
            </Button> {sendSymbol} <T tag='span' i18nKey='app.widget.dueToLocation'>
              <a style={{ color: 'rgba(0, 255, 222, 1)' }} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noreferrer noopener'>
              due to your location.
              </a>
            </T>
          </small>
        </Alert>
      )}
      {assetSelect && (
        <div 
          onClick={onCloseAssetSelector} 
          className='position-fixed' 
          style={{ width: '100%', height: '100%', top: 0, left: 0, zIndex: 9 }}
        ></div>
      )}
      <Form onSubmit={handleSubmit}>
        <Card className={classNames('justify-content-center p-0 m-0', style.container, style.stepOne)}>
          {isAppBlocked && (
            <Overlay>
              <h4 className='text-center'>Unfortunately, due to regulations Faa.st is unable to serve your country.</h4>
            </Overlay>
          )}
          <CardHeader style={{ backgroundColor: '#394045' }} className='text-left pl-4 border-0'>
            <h4 className='my-1'><img src={FaastLogo} className='mr-2' width="30" height="30" /> Faa.st</h4>
          </CardHeader>
          <ProgressBar 
            text={'Choose Assets'}
            currentStep={1}
          />
          <CardBody className='pt-3'>
            <Row className='gutter-0'>
              <Col className='position-relative' xs={{ size: 12, order: 1 }}>
                {assetSelect === 'send' && (
                  <div className={style.assetListContainer} style={{ zIndex: 999 }}>
                    <AssetSelector 
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
                      dark={false}
                      rowsToShow={3}
                    />
                  </div>
                )}
                <StepOneField
                  name='sendAmount'
                  type='number'
                  step='any'
                  placeholder={`${t('app.widget.sendAmountPlaceholder', 'Send amount')}${t('app.widget.optionalPlaceholder', ' (optional)')}`}
                  label={t('app.widget.youSend','You send')}
                  onChange={onChangeSendAmount}
                  validate={validateSendAmount}
                  inputClass={classNames({ 'font-italic': estimatedField === 'send' })}
                  inputGroupClass='flat'
                  labelClass='d-block'
                  fixedFeedback
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'light'} size='sm' className={style.inputButton} onClick={() => setAssetSelect('send')}>
                        <CoinIcon key={sendSymbol} symbol={sendSymbol} size={1.25} className='mr-2'/>
                        {sendSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                  helpText={!sendAmount ? (
                    <T tag='span' i18nKey='app.widget.omitted'><FormText color="dark">When omitted, a variable market rate is used.</FormText></T>
                  ) : estimatedField === 'send' ? (
                    <T tag='span' i18nKey='app.widget.approxSend'><FormText color="dark">Approximately how much you need to send. Click Create to receive a guaranteed quote.</FormText></T>
                  ) : (
                    <T tag='span' i18nKey='app.widget.expectSend'><FormText color="dark">The amount we expect you to send.</FormText></T>
                  )}
                />
              </Col>
              <Col xs={{ size: 12, order: 3 }} style={{ position: 'relative', top: -15, right: 25, maxHeight: 20 }} className='text-right m-0'>
                <Button color='transparent' onClick={handleSwitchAssets} className={classNames('p-0', style.reverse)}>
                  <SwapIcon />
                </Button>
              </Col>
              <Col xs={{ size: 12, order: 4 }} lg={{ size: 12, order: 3 }}>
                {assetSelect === 'receive' && (
                  <div className={style.assetListContainer} style={{ zIndex: 999 }}>
                    <AssetSelector 
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
                      rowsToShow={3}
                      dark={false}
                    />
                  </div>
                )}
                <StepOneField
                  name='receiveAmount'
                  type='number'
                  step='any'
                  placeholder={t('app.widget.receiveAmountPlaceholder', 'Receive amount')}
                  validate={validateReceiveAmount}
                  label={t('app.widget.youReceive', 'You receive')}
                  onChange={onChangeReceiveAmount}
                  inputGroupClass='flat'
                  inputClass={classNames({ 'font-italic': estimatedField === 'receive' })}
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'light'} size='sm' className={style.inputButton} onClick={() => setAssetSelect('receive')}>
                        <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                        {receiveSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                  helpText={estimatedField === 'receive' && receiveAmount ? (
                    <T tag='span' i18nKey='app.widget.approxReceive'><FormText color="dark">Approximately how much you will receive. Click Create to receive a guaranteed quote.</FormText></T>
                  ) : !receiveAmount ? (
                    null
                  ) : (
                    <T tag='span' i18nKey='app.widget.guaranteeReceive'><FormText color="dark">The amount you are guaranteed to receive.</FormText></T>
                  )}
                />
              </Col>
            </Row>
            <div className='mt-0 mb-4'>
              <Checkbox
                label={
                  <T tag='small' i18nKey='app.widget.acceptTerms' className='pl-1 text-dark'>I accept the 
                    <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faa.st Terms & Conditions</a>
                  </T>
                }
                labelClass='p-0'
              />
            </div>
            <GAEventButton 
              className={classNames('mt-2 mb-0 mx-auto', style.customButton)} 
              color={rateError ? 'danger' : 'primary'} 
              type='submit' 
              event={{ category: 'Swap', action: 'Create Swap' }}
              disabled={Boolean(isSubmittingSwap || rateError)}
            >
              {!isSubmittingSwap && !rateError ? (
                <span>Continue</span>
              ) : rateError ? (
                <T tag='span' i18nKey='app.widget.noRate'>Unable to retrieve rate</T>
              ) : (
                <T tag='span' i18nKey='app.widget.generatingSwap'>Generating Swap...</T>
              )}
            </GAEventButton>
          </CardBody>
          <div style={{ color: '#B5BCC4' }} className='text-center font-xs mb-3'>
            <span>powered by <a href='https://faa.st' target='_blank noreferrer'>Faa.st</a></span>
          </div>
        </Card>
      </Form>
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapStepOne'),
  withTranslation(),
  setPropTypes({
    sendSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
    defaultSendAmount: PropTypes.number,
    defaultReceiveAmount: PropTypes.number,
  }),
  defaultProps({
    defaultSendSymbol: DEFAULT_SEND_SYMBOL,
    defaultReceiveSymbol: DEFAULT_RECEIVE_SYMBOL,
    defaultSendAmount: DEFAULT_SEND_AMOUNT,
    defaultReceiveAmount: null,
  }),
  connect(createStructuredSelector({
    assetSymbols: getAllAssetSymbols,
    sendAsset: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    sendAmount: (state) => getFormValue(state, 'sendAmount'),
    receiveAmount: (state) => getFormValue(state, 'receiveAmount'),
    limit: getGeoLimit,
    previousSwapInputs: getSavedSwapWidgetInputs,
    isAppBlocked
  }), {
    retrievePairData: retrievePairData,
    saveSwapWidgetInputs: saveSwapWidgetInputs,
  }),
  withState('sendSymbol', 'updateSendSymbol', ({ defaultSendSymbol, previousSwapInputs }) => (previousSwapInputs && previousSwapInputs.from) || defaultSendSymbol),
  withState('receiveSymbol', 'updateReceiveSymbol', ({ defaultReceiveSymbol, previousSwapInputs }) => (previousSwapInputs && previousSwapInputs.to) || defaultReceiveSymbol),
  connect(createStructuredSelector({
    sendAsset: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
  }), {
  }),
  withProps(({
    sendSymbol, receiveSymbol, defaultSendAmount, defaultReceiveAmount, sendAsset, 
    limit, previousSwapInputs
  }) => { 
    const maxGeoBuy = limit && toBigNumber(limit.per_transaction.amount)
      .div(sendAsset.price).round(sendAsset.decimals, BigNumber.ROUND_DOWN)
    const { toAmount, fromAmount } = previousSwapInputs || {}
    return ({
      pair: `${sendSymbol}_${receiveSymbol}`,
      initialValues: {
        sendAmount: fromAmount ? parseFloat(fromAmount) : defaultSendAmount,
        receiveAmount: toAmount ? parseFloat(toAmount) : defaultReceiveAmount,
      },
      maxGeoBuy
    })}),
  connect(createStructuredSelector({
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    rateStale: (state, { pair }) => isRateStale(state, pair),
    minimumSend: (state, { pair }) => getRateMinimumDeposit(state, pair),
    maximumSend: (state, { pair }) => getRateMaximumDeposit(state, pair),
    minimumReceive: (state, { pair }) => getRateMinimumWithdrawal(state, pair),
    maximumReceive: (state, { pair }) => getRateMaximumWithdrawal(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
    rateError: (state, { pair }) => rateError(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // send, receive, or null
  withState('estimatedField', 'setEstimatedField', 'receive'), // send or receive
  withState('isSubmittingSwap', 'updateIsSubmittingSwap', false),
  withHandlers({
    onCloseAssetSelector: ({ setAssetSelect }) => () => {
      setAssetSelect(null)
    },
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
    validateDepositTag: () => validator.all(
      validator.number(),
      validator.integer()
    ),
    onSubmit: ({ sendSymbol, receiveSymbol, updateIsSubmittingSwap, saveSwapWidgetInputs }) => (values) => {
      updateIsSubmittingSwap(true)
      let { sendAmount, receiveAmount } = values
      saveSwapWidgetInputs({
        to: receiveSymbol,
        from: sendSymbol,
        toAmount: receiveAmount ? parseFloat(receiveAmount) : undefined,
        fromAmount: sendAmount ? parseFloat(sendAmount) : undefined,
        currentStep: 2
      })
      updateIsSubmittingSwap(false)
    }
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withHandlers(({ change }) => {
    const setEstimatedReceiveAmount = (x) => {
      log.trace('setEstimatedReceiveAmount', x)
      change('receiveAmount', x && toBigNumber(x))
    }
    const setEstimatedSendAmount = (x) => {
      log.trace('setEstimatedSendAmount', x)
      change('sendAmount', x && toBigNumber(x))
    }
    return {
      calculateReceiveEstimate: ({
        receiveAsset, estimatedRate, setEstimatedField, sendAsset
      }) => (sendAmount) => {
        if (estimatedRate && sendAmount) {
          sendAmount = toBigNumber(sendAmount).round(sendAsset.decimals)
          const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(receiveAsset.decimals)
          setEstimatedReceiveAmount(estimatedReceiveAmount.toString())
        } else {
          setEstimatedReceiveAmount(null)
        }
        setEstimatedField('receive')
      },
      calculateSendEstimate: ({
        sendAsset, estimatedRate, setEstimatedField, receiveAsset
      }) => (receiveAmount) => {
        if (estimatedRate && receiveAmount) {
          receiveAmount = toBigNumber(receiveAmount).round(receiveAsset.decimals)
          const estimatedSendAmount = receiveAmount.times(estimatedRate).round(sendAsset.decimals)
          setEstimatedSendAmount(estimatedSendAmount.toString())
        } else {
          setEstimatedSendAmount(null)
        }
        setEstimatedField('send')
      },
    }
  }),
  withHandlers({
    setSendAmount: ({ change, touch, calculateReceiveEstimate, sendAsset }) => (x) => {
      log.debug('setSendAmount', x)
      change('sendAmount', x && toBigNumber(x).round(sendAsset.decimals).toString())
      touch('sendAmount')
      calculateReceiveEstimate(x)
    },
    setReceiveAmount: ({ change, touch, calculateSendEstimate, receiveAsset }) => (x) => {
      log.debug('setReceiveAmount', x)
      change('receiveAmount', x && toBigNumber(x).round(receiveAsset.decimals).toString())
      touch('receiveAmount')
      calculateSendEstimate(x)
    },
  }),
  withHandlers({
    handleSelectGeoMax: ({ maxGeoBuy, setSendAmount }) => () => {
      setSendAmount(maxGeoBuy)
    },
    handleSelectMinimum: ({ minimumSend, setSendAmount }) => () => {
      setSendAmount(minimumSend)
    },
    handleSelectMaximum: ({ maximumSend, setSendAmount }) => () => {
      setSendAmount(maximumSend)
    },
    handleSelectMaximumReceive: ({ maximumReceive, setReceiveAmount }) => () => {
      setReceiveAmount(maximumReceive)
    },
    handleSelectMinimumReceive: ({ minimumReceive, setReceiveAmount }) => () => {
      setReceiveAmount(minimumReceive)
    }
  }),
  withHandlers({
    onChangeReceiveAmount: ({ calculateSendEstimate }) => (_, newReceiveAmount) => {
      calculateSendEstimate(newReceiveAmount)
    },
    onChangeSendAmount: ({ calculateReceiveEstimate }) => (_, newSendAmount) => {
      calculateReceiveEstimate(newSendAmount)
    },
    validateSendAmount: ({ minimumSend, maximumSend, sendAsset,
      sendSymbol, sendWallet, maxGeoBuy, handleSelectGeoMax, handleSelectMinimum,
      handleSelectMaximum, t, estimatedField }) => {
      return (
        validator.all(
          ...(sendWallet ? [validator.required()] : []),
          validator.number(),
          ...(estimatedField === 'receive' && minimumSend ? [validator.gte(minimumSend, <span key={'minimumSend'}>{t('app.widget.sendAmountAtLeast', 'Send amount must be at least')} <Button key={'minimumSend1'} color='link-plain' onClick={handleSelectMinimum}>
            <Units key={'minimumSend2'} precision={sendAsset.decimals} roundingType='dp' value={minimumSend}/>
          </Button> {sendSymbol} </span>)] : []),
          ...(maxGeoBuy ? [validator.lte(maxGeoBuy, <span key={Math.random()}>{t('app.widget.sendAmountGreaterThan', 'Send amount cannot be greater than')} <Button color='link-plain' onClick={handleSelectGeoMax}>
            <Units precision={sendAsset.decimals} roundingType='dp' value={maxGeoBuy}/>
          </Button> {sendSymbol} <a key={Math.random()} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>{t('app.widget.dueToYourLocation', 'due to your location.')}</a></span>)] : []),
          ...(estimatedField === 'receive' && maximumSend ? [validator.lte(maximumSend, <span key={'maxSend'}>{t('app.widget.sendAmountGreaterThan', 'Send amount cannot be greater than')} <Button key={'maxSend1'} color='link-plain' onClick={handleSelectMaximum}>
            <Units key={'maxSend2'} precision={sendAsset.decimals} roundingType='dp' value={maximumSend}/></Button> {t('app.widget.ensurePricing', 'to ensure efficient pricing.')}</span>)] : []),
        )
      )
    },
    validateReceiveAmount: ({ maximumReceive, estimatedField, minimumReceive, handleSelectMaximumReceive, handleSelectMinimumReceive, sendAsset, receiveSymbol, t }) => {
      return ( 
        validator.all(
          validator.number(),
          ...(estimatedField === 'send' && maximumReceive ? [validator.lte(maximumReceive, <span key={'maxReceive'}>{t('app.widget.receiveAmountGreaterThan', 'Receive amount cannot be greater than')} <Button key={'maxReceive2'} color='link-plain' onClick={handleSelectMaximumReceive}>
            <Units key={'maxReceive3'} precision={sendAsset.decimals} roundingType='dp' value={maximumReceive}/></Button> {t('app.widget.ensurePricing', 'to ensure efficient pricing.')}</span>)] : []),
          ...(estimatedField === 'send' && minimumReceive ? [validator.gte(minimumReceive, <span key={'minimumReceive'}>{t('app.widget.receiveAmountAtLeast', 'Receive amount must be at least')} <Button key={'minimumReceive1'} color='link-plain' onClick={handleSelectMinimumReceive}>
            <Units key={'minimumReceive2'} precision={sendAsset.decimals} roundingType='dp' value={minimumReceive}/>
          </Button> {receiveSymbol} </span>)] : []),
        )
      )
    },
    handleSelectedAsset: ({ assetSelect, setAssetSelect, sendSymbol, 
      receiveSymbol, updateSendSymbol, updateReceiveSymbol }) => (asset) => {
      const { symbol } = asset
      let from = sendSymbol
      let to = receiveSymbol
      if (assetSelect === 'send') {
        if (symbol === receiveSymbol) {
          to = from
        }
        from = symbol
      } else { // receive
        if (symbol === sendSymbol) {
          from = to
        }
        to = symbol
      }
      updateSendSymbol(from)
      updateReceiveSymbol(to)
      setAssetSelect(null)
    },
  }),
  withHandlers({
    handleSwitchAssets: ({ sendSymbol, receiveSymbol, sendAmount, 
      calculateSendEstimate, estimatedField, calculateReceiveEstimate, receiveAmount,
      updateSendSymbol, updateReceiveSymbol }) => () => {
      updateSendSymbol(receiveSymbol)
      updateReceiveSymbol(sendSymbol)
      if (estimatedField === 'receive') {
        calculateReceiveEstimate(sendAmount)
      } else {
        calculateSendEstimate(receiveAmount)
      }
    },
    checkQueryParams: () => () => {
      const urlParams = qs.parse(location.search)
      return urlParams
    }
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      const {
        rateLoaded, pair, retrievePairData, estimatedRate, calculateSendEstimate, 
        calculateReceiveEstimate, estimatedField, sendAmount, receiveAmount, rateStale
      } = this.props
      if (pair && (!rateLoaded || rateStale)) {
        retrievePairData(pair, null, estimatedField === 'receive' ? sendAmount : undefined, estimatedField === 'send' ? receiveAmount : undefined)
      }
      if (prevProps.estimatedRate !== estimatedRate) {
        if (estimatedField === 'receive') {
          calculateReceiveEstimate(sendAmount)
        } else {
          calculateSendEstimate(receiveAmount)
        }
      }
    },
    componentWillMount() {
      const { sendSymbol, receiveSymbol, estimatedField, retrievePairData, pair, sendAmount, receiveAmount,
        updateSendSymbol, updateReceiveSymbol } = this.props
      if (sendSymbol === receiveSymbol) {
        let from = DEFAULT_SEND_SYMBOL
        let to = DEFAULT_RECEIVE_SYMBOL
        if (to === sendSymbol || from === receiveSymbol) {
          from = to
          to = DEFAULT_SEND_SYMBOL
        }
        updateSendSymbol(from)
        updateReceiveSymbol(to)
      } else {
        retrievePairData(pair, null, estimatedField === 'receive' ? sendAmount : undefined, estimatedField === 'send' ? receiveAmount : undefined)
      }
    },
    componentDidMount() {
      const { maxGeoBuy, handleSelectGeoMax, defaultSendAmount,  setSendAmount, previousSwapInputs } = this.props
      setSendAmount((previousSwapInputs && previousSwapInputs.fromAmount) || DEFAULT_SEND_AMOUNT)
      if (maxGeoBuy && maxGeoBuy < defaultSendAmount) {
        handleSelectGeoMax()
      }
    },
  }),
)(SwapStepOne)

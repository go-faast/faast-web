import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector, SubmissionError } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import {
  Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText, Alert
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import * as qs from 'query-string'
import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'
import { saveSwapWidgetInputs } from 'Actions/app'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumDeposit, rateError } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit, getSavedSwapWidgetInputs } from 'Selectors/app'

import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import T from 'Components/i18n/T'
import Units from 'Components/Units'
import { toChecksumAddress } from 'Utilities/convert'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import debounceHandler from 'Hoc/debounceHandler'

import SwapIcon from 'Img/swap-icon.svg?inline'

import style from './style.scss'
import Faast from 'Src/services/Faast'

const DEFAULT_SEND_SYMBOL = 'BTC'
const DEFAULT_RECEIVE_SYMBOL = 'ETH'
const DEFAULT_SEND_AMOUNT = 1
const FORM_NAME = 'swapWidget'
const DEBOUNCE_WAIT = 5000 // ms

const getFormValue = formValueSelector(FORM_NAME)

const StepOneField = withProps(({ labelClass, inputClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass),
  inputClass: classNames('flat', inputClass),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', sm: '3', md: '2', lg: '12', className: 'text-left text-sm-right text-lg-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapStepOne = ({
  change, untouch, submitting, balancesLoaded,
  sendSymbol, receiveSymbol, assetSymbols, assetSelect, setAssetSelect, 
  validateReceiveAddress, validateRefundAddress, validateSendAmount, validateReceiveAmount,
  handleSubmit, handleSelectedAsset, handleSwitchAssets, isAssetDisabled,
  onChangeSendAmount, handleSelectFullBalance, fullBalanceAmount, fullBalanceAmountLoaded,
  sendWallet, defaultRefundAddress, defaultReceiveAddress, maxGeoBuy, handleSelectGeoMax,
  onChangeReceiveAmount, estimatedField, sendAmount, receiveAmount, previousSwapInputs,
  onChangeRefundAddress, onChangeReceiveAddress, rateError, sendAsset
}) => (
  <Fragment>
    <ProgressBar steps={[
      <T key='1' tag='span' i18nKey='app.progressBar.createSwap'>Create Swap</T>, 
      <T key='2' tag='span' i18nKey='app.progressBar.sendSymbol'>Send {sendSymbol}</T>, 
      <T key='3' tag='span' i18nKey='app.progressBar.receiveSymbol'>Receive {receiveSymbol}</T>
    ]} 
    currentStep={0}
    />
    {maxGeoBuy && (
      <Alert color='info' className='mx-auto mt-3 w-75 text-center'>
        <small>
      Please note: The maximum you can swap is <Button style={{ color: 'rgba(0, 255, 222, 1)' }} color='link-plain' onClick={handleSelectGeoMax}><Units precision={sendAsset.decimals} roundingType='dp' value={maxGeoBuy}/></Button> {sendSymbol} <a style={{ color: 'rgba(0, 255, 222, 1)' }} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noreferrer noopener'>due to your location.</a>
        </small>
      </Alert>
    )}
    {!balancesLoaded ? (
      <LoadingFullscreen label='Loading balances...'/>
    ) : (
      <Form onSubmit={handleSubmit}>
        <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
          <CardHeader className='text-center'>
            <T tag='h4' i18nKey='app.widget.swapInstantly' className='my-1'>Swap Instantly</T>
          </CardHeader>
          <CardBody className='pt-3'>
            <Row className='gutter-0'>
              <Col xs={{ size: 12, order: 1 }} lg>
                <StepOneField
                  name='sendAmount'
                  type='number'
                  step='any'
                  placeholder={`Send amount${sendWallet ? '' : ' (optional)'}`}
                  validate={validateSendAmount}
                  label={'You send'}
                  onChange={onChangeSendAmount}
                  inputClass={classNames({ 'font-italic': estimatedField === 'send' })}
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('send')}>
                        <CoinIcon key={sendSymbol} symbol={sendSymbol} size={1.25} className='mr-2'/>
                        {sendSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                  helpText={sendWallet ? (
                    <FormText color="muted">
                      <T tag='span' i18nKey='app.widget.youHave'>You have</T> {fullBalanceAmountLoaded ? (
                        <Button color='link-plain' onClick={handleSelectFullBalance}>
                          <Units precision={sendAsset.decimals} roundingType='dp' value={fullBalanceAmount}/>
                        </Button>
                      ) : (
                        <i className='fa fa-spinner fa-pulse'/>
                      )} {sendSymbol}
                    </FormText>
                  ) : !sendAmount ? (
                    <T tag='span' i18nKey='app.widget.omitted'><FormText color="muted">When omitted, a variable market rate is used.</FormText></T>
                  ) : estimatedField === 'send' ? (
                    <T tag='span' i18nKey='app.widget.approxSend'><FormText color="muted">Approximately how much you need to send. Click Create to receive a guaranteed quote.</FormText></T>
                  ) : (
                    <T tag='span' i18nKey='app.widget.expectSend'><FormText color="muted">The amount we expect you to send.</FormText></T>
                  )}
                />
              </Col>
              <Col xs={{ size: 12, order: 3 }} lg={{ size: 1, order: 2 }} className='text-right text-lg-center'>
                <Button color='primary' onClick={handleSwitchAssets} className={style.reverse}>
                  <SwapIcon/>
                </Button>
              </Col>
              <Col xs={{ size: 12, order: 4 }} lg={{ size: true, order: 3 }}>
                <StepOneField
                  name='receiveAmount'
                  type='number'
                  step='any'
                  placeholder='Receive amount'
                  validate={validateReceiveAmount}
                  label={'You receive'}
                  onChange={onChangeReceiveAmount}
                  inputClass={classNames({ 'font-italic': estimatedField === 'receive' })}
                  addonAppend={({ invalid }) => (
                    <InputGroupAddon addonType="append">
                      <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('receive')}>
                        <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                        {receiveSymbol} <i className='fa fa-caret-down'/>
                      </Button>
                    </InputGroupAddon>
                  )}
                  helpText={estimatedField === 'receive' && receiveAmount ? (
                    <T tag='span' i18nKey='app.widget.approxReceive'><FormText color="muted">Approximately how much you will receive. Click Create to receive a guaranteed quote.</FormText></T>
                  ) : !receiveAmount ? (
                    null
                  ) : (
                    <T tag='span' i18nKey='app.widget.guaranteeReceive'><FormText color="muted">The amount you are guaranteed to receive.</FormText></T>
                  )}
                />
              </Col>
              <div className='w-100 order-3'/>
              <Col xs={{ size: 12, order: 2 }} lg={{ size: true, order: 4 }}>
                <WalletSelectField
                  tag={StepOneField}
                  addressFieldName='refundAddress'
                  walletIdFieldName='sendWalletId'
                  placeholder={sendSymbol !== 'XMR' ? `${sendSymbol} return address (optional)` : `${sendSymbol} return address`}
                  label='From wallet'
                  labelClass='mt-3 mt-sm-0 mt-lg-3'
                  validate={validateRefundAddress}
                  symbol={sendSymbol}
                  change={change}
                  untouch={untouch}
                  defaultValue={previousSwapInputs ? previousSwapInputs.fromAddress : defaultRefundAddress}
                  formName={FORM_NAME}
                  onChange={onChangeRefundAddress}
                  requiredLabel={sendSymbol === 'XMR'}
                  disableNoBalance
                />
              </Col>
              <Col lg={{ size: 1, order: 5 }}/>
              <Col xs={{ size: 12, order: 6 }} lg>
                <WalletSelectField 
                  tag={StepOneField}
                  addressFieldName='receiveAddress'
                  walletIdFieldName='receiveWalletId'
                  placeholder={`${receiveSymbol} receive address`}
                  label='To wallet'
                  labelClass='mt-3 mt-sm-0 mt-lg-3'
                  validate={validateReceiveAddress}
                  symbol={receiveSymbol}
                  change={change}
                  defaultValue={previousSwapInputs ? previousSwapInputs.toAddress : defaultReceiveAddress}
                  untouch={untouch}
                  formName={FORM_NAME}
                  onChange={onChangeReceiveAddress}
                  requiredLabel
                />
              </Col>
            </Row>
            <div className='mt-2 mb-4'>
              <Checkbox
                label={
                  <T tag='small' i18nKey='app.widget.acceptTerms' className='pl-1 text-white'>I accept the 
                    <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faa.st Terms & Conditions</a>
                  </T>
                }
                labelClass='p-0'
              />
            </div>
            <Button className={classNames('mt-2 mb-2 mx-auto', style.submitButton)} color={rateError ? 'danger' : 'primary'} type='submit' disabled={Boolean(submitting || rateError)}>
              {!submitting && !rateError ? (
                <T tag='span' i18nKey='app.widget.createSwap'>Create Swap</T>
              ) : rateError ? (
                <T tag='span' i18nKey='app.widget.noRate'>Unable to retreive rate</T>
              ) : (
                <T tag='span' i18nKey='app.widget.generatingSwap'>Generating Swap...</T>
              )}
            </Button>
          </CardBody>
        </Card>
      </Form>
    )}
    <Modal size='lg' isOpen={Boolean(assetSelect)} toggle={() => setAssetSelect(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
      <ModalHeader toggle={() => setAssetSelect(null)} tag='h4' className='text-primary'>
        {assetSelect === 'send' ? (
          <T tag='span' i18nKey='app.widget.chooseSend'>Choose Asset to Send</T>
        ) : (
          <T tag='span' i18nKey='app.widget.chooseReceive'>Choose Asset to Receive</T>
        )}
      </ModalHeader>
      <ModalBody>
        {assetSelect && (
          <AssetSelector 
            selectAsset={handleSelectedAsset} 
            supportedAssetSymbols={assetSymbols}
            isAssetDisabled={isAssetDisabled}
          />
        )}
      </ModalBody>
    </Modal>
  </Fragment>
)

export default compose(
  setDisplayName('SwapStepOne'),
  setPropTypes({
    sendSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
    defaultSendAmount: PropTypes.number,
    defaultReceiveAmount: PropTypes.number,
    defaultRefundAddress: PropTypes.string,
    defaultReceiveAddress: PropTypes.string,
  }),
  defaultProps({
    sendSymbol: DEFAULT_SEND_SYMBOL,
    receiveSymbol: DEFAULT_RECEIVE_SYMBOL,
    defaultSendAmount: DEFAULT_SEND_AMOUNT,
    defaultReceiveAmount: null,
    defaultRefundAddress: undefined,
    defaultReceiveAddress: undefined,
  }),
  connect(createStructuredSelector({
    assetSymbols: getAllAssetSymbols,
    sendAsset: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    sendAmount: (state) => getFormValue(state, 'sendAmount'),
    receiveAmount: (state) => getFormValue(state, 'receiveAmount'),
    refundAddress: (state) => getFormValue(state, 'refundAddress'),
    receiveAddress: (state) => getFormValue(state, 'receiveAddress'),
    sendWallet: (state) => getWallet(state, getFormValue(state, 'sendWalletId')),
    balancesLoaded: areCurrentPortfolioBalancesLoaded,
    limit: getGeoLimit,
    previousSwapInputs: getSavedSwapWidgetInputs
    
  }), {
    createSwap: createSwapAction,
    push: pushAction,
    updateQueryString: updateQueryStringReplace,
    retrievePairData: retrievePairData,
    openViewOnly: openViewOnlyWallet,
    saveSwapWidgetInputs: saveSwapWidgetInputs
  }),
  withProps(({
    sendSymbol, receiveSymbol,
    defaultSendAmount, defaultReceiveAmount,
    defaultRefundAddress, defaultReceiveAddress,
    sendWallet, sendAsset, limit, previousSwapInputs
  }) => { 
    const maxGeoBuy = limit ? limit.per_transaction.amount / parseFloat(sendAsset.price) : undefined
    const { toAmount, fromAmount, toAddress, fromAddress } = previousSwapInputs || {}
    return ({
      pair: `${sendSymbol}_${receiveSymbol}`,
      initialValues: {
        sendAmount: fromAmount ? parseFloat(fromAmount) : defaultSendAmount,
        receiveAmount: toAmount ? parseFloat(toAmount) : defaultReceiveAmount,
        refundAddress: fromAddress ? fromAddress : defaultRefundAddress,
        receiveAddress: toAddress ? toAddress : defaultReceiveAddress,
      },
      fullBalanceAmount: sendWallet && (sendWallet.balances[sendSymbol] || '0'),
      fullBalanceAmountLoaded: sendWallet && sendWallet.balancesLoaded,
      maxGeoBuy,
    })}),
  connect(createStructuredSelector({
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    minimumSend: (state, { pair }) => getRateMinimumDeposit(state, pair),
    maximumSend: (state, { pair }) => getRateMaximumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
    rateError: (state, { pair }) => rateError(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // send, receive, or null
  withState('estimatedField', 'setEstimatedField', 'receive'), // send or receive
  withHandlers({
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
    validateReceiveAddress: ({ receiveAsset }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset)
    ),
    validateRefundAddress: ({ sendAsset }) => validator.all(
      ...(sendAsset.symbol === 'XMR' ? [validator.required()] : []),
      validator.walletAddress(sendAsset)
    ),
    onSubmit: ({
      sendSymbol, receiveAsset, sendAsset,
      createSwap, openViewOnly, push, estimatedField
    }) => async (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { sendAmount, receiveAddress, refundAddress, sendWalletId, receiveWalletId, receiveAmount } = values
      if (receiveSymbol == 'ETH' || ERC20) {
        toChecksumAddress(receiveAddress)
      }
      if (sendSymbol == 'ETH' || sendAsset.ERC20) {
        toChecksumAddress(refundAddress)
      }
      try {
        const receiveValidation = await Faast.validateAddress(receiveAddress, receiveSymbol)
        if (!receiveValidation.valid) {
          throw `Invalid ${receiveSymbol} address`
        } else if (receiveValidation.valid && receiveAddress !== receiveValidation.standardized) {
          throw `Invalid ${receiveSymbol} address format. Here is your address converted to the correct format: ${receiveValidation.standardized}`
        }
      } catch (err) {
        throw new SubmissionError({
          receiveAddress: err,
        })
      }
      try { 
        const sendValidation = await Faast.validateAddress(refundAddress, sendSymbol)
        if (!sendValidation.valid) {
          throw `Invalid ${sendSymbol} address`
        } else if (sendValidation.valid && refundAddress !== sendValidation.standardized) {
          throw `Invalid ${sendSymbol} address format. Here is your address converted to the correct format: ${sendValidation.standardized}`
        }
      } catch (err) {
        throw new SubmissionError({
          refundAddress: err,
        })
      }

      return createSwap({
        sendSymbol: sendSymbol,
        sendAmount: sendAmount && estimatedField !== 'send' ? toBigNumber(sendAmount).round(sendAsset.decimals) : undefined,
        sendWalletId,
        receiveSymbol,
        receiveWalletId,
        receiveAddress,
        refundAddress,
        receiveAmount: sendAmount && estimatedField !== 'receive' ? toBigNumber(receiveAmount).round(receiveAsset.decimals) : undefined
      })
        .then((swap) => {
          push(`/swap/send?id=${swap.orderId}`)
          if (receiveSymbol === 'ETH' || ERC20) { 
            return openViewOnly(receiveAddress, null)
          }
        })
    },
    handleSaveSwapWidgetInputs: ({ saveSwapWidgetInputs, receiveAsset, sendAsset, 
      receiveAddress, refundAddress, receiveAmount, sendAmount }) => (inputs) => {
      const { to, from, toAddress, fromAddress, toAmount, fromAmount } = inputs
      saveSwapWidgetInputs({
        to: to ? to : receiveAsset.symbol,
        from: from ? from : sendAsset.symbol,
        toAddress: toAddress ? toAddress : receiveAddress,
        fromAddress: fromAddress ? fromAddress : refundAddress,
        toAmount: toAmount ? toAmount : receiveAmount ? parseFloat(receiveAmount) : undefined,
        fromAmount: fromAmount ? fromAmount : sendAmount ? parseFloat(sendAmount) : undefined,
      })
    }
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  withHandlers({
    updateURLParams: ({ updateQueryString, handleSaveSwapWidgetInputs }) => (params) => {
      updateQueryString(params)
      handleSaveSwapWidgetInputs(params)
    }
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
        receiveAsset, estimatedRate, setEstimatedField, updateURLParams, sendAsset
      }) => (sendAmount) => {
        if (estimatedRate && sendAmount) {
          sendAmount = toBigNumber(sendAmount).round(sendAsset.decimals)
          const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(receiveAsset.decimals)
          updateURLParams({ 
            toAmount: estimatedReceiveAmount ? parseFloat(estimatedReceiveAmount) : undefined,
            fromAmount: sendAmount ? parseFloat(sendAmount) : undefined
          })
          setEstimatedReceiveAmount(estimatedReceiveAmount.toString())
        } else {
          setEstimatedReceiveAmount(null)
        }
        setEstimatedField('receive')
      },
      calculateSendEstimate: ({
        sendAsset, estimatedRate, setEstimatedField, updateURLParams, receiveAsset
      }) => (receiveAmount) => {
        if (estimatedRate && receiveAmount) {
          receiveAmount = toBigNumber(receiveAmount).round(receiveAsset.decimals)
          const estimatedSendAmount = receiveAmount.times(estimatedRate).round(sendAsset.decimals)
          updateURLParams({ 
            fromAmount: estimatedSendAmount ? parseFloat(estimatedSendAmount) : undefined,
            toAmount: receiveAmount ? parseFloat(receiveAmount) : undefined
          })
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
    }
  }),
  withHandlers({
    handleSelectFullBalance: ({ fullBalanceAmount, setSendAmount }) => () => {
      setSendAmount(fullBalanceAmount)
    },
    onChangeReceiveAmount: ({ calculateSendEstimate }) => (_, newReceiveAmount) => {
      calculateSendEstimate(newReceiveAmount)
    },
    onChangeSendAmount: ({ calculateReceiveEstimate }) => (_, newSendAmount) => {
      calculateReceiveEstimate(newSendAmount)
    },
    onChangeRefundAddress: ({ updateURLParams }) => (_, newRefundAddress) => {
      updateURLParams({ fromAddress: newRefundAddress })
    },
    onChangeReceiveAddress: ({ updateURLParams }) => (_, newReceiveAddress) => {
      updateURLParams({ toAddress: newReceiveAddress })
    },
    validateSendAmount: ({ minimumSend, maximumSend, sendAsset,
      sendSymbol, sendWallet, fullBalanceAmount, maxGeoBuy, handleSelectGeoMax, handleSelectMinimum,
      handleSelectMaximum }) => {
      return (
        validator.all(
          ...(sendWallet ? [validator.required()] : []),
          validator.number(),
          ...(minimumSend ? [validator.gte(minimumSend, <span key={'minimumSend'}>Send amount must be at least <Button key={'minimumSend1'} color='link-plain' onClick={handleSelectMinimum}>
            <Units key={'minimumSend2'} precision={sendAsset.decimals} roundingType='dp' value={minimumSend}/>
          </Button> {sendSymbol} </span>)] : []),
          ...(maxGeoBuy ? [validator.lte(maxGeoBuy, <span key={Math.random()}>Send amount cannot be greater than <Button color='link-plain' onClick={handleSelectGeoMax}>
            <Units precision={sendAsset.decimals} roundingType='dp' value={maxGeoBuy}/>
          </Button> {sendSymbol} <a key={Math.random()} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>due to your location.</a></span>)] : []),
          ...(sendWallet ? [validator.lte(fullBalanceAmount, 'Cannot send more than you have.')] : []),
          ...(maximumSend ? [validator.lte(maximumSend, <span key={'maxSend'}>Send amount cannot be greater than <Button key={'maxSend1'} color='link-plain' onClick={handleSelectMaximum}>
            <Units key={'maxSend2'} precision={sendAsset.decimals} roundingType='dp' value={maximumSend}/></Button> to ensure efficient pricing.</span>)] : []),
        )
      )
    },
    validateReceiveAmount: () => {
      return validator.number()
    },
    handleSelectedAsset: ({ assetSelect, updateURLParams, setAssetSelect, sendSymbol, receiveSymbol }) => (asset) => {
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
      setAssetSelect(null)
      updateURLParams({ from, to })
    },
  }),
  withHandlers({
    handleSwitchAssets: ({ updateURLParams, sendSymbol, receiveSymbol, sendAmount, 
      calculateSendEstimate, estimatedField, calculateReceiveEstimate, receiveAmount }) => () => {
      updateURLParams({ from: receiveSymbol, to: sendSymbol })
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
        calculateReceiveEstimate, estimatedField, sendAmount, receiveAmount, checkQueryParams,
        previousSwapInputs, updateURLParams,
      } = this.props
      const urlParams = checkQueryParams()
      if (Object.keys(urlParams).length === 0 && previousSwapInputs) {
        updateURLParams(previousSwapInputs)
      }
      if (pair && !rateLoaded) {
        retrievePairData(pair)
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
      const { updateURLParams, sendSymbol, receiveSymbol, retrievePairData, pair } = this.props
      if (sendSymbol === receiveSymbol) {
        let from = DEFAULT_SEND_SYMBOL
        let to = DEFAULT_RECEIVE_SYMBOL
        if (to === sendSymbol || from === receiveSymbol) {
          from = to
          to = DEFAULT_SEND_SYMBOL
        }
        updateURLParams({ to, from })
      } else {
        retrievePairData(pair)
      }
    },
    componentDidMount() {
      const { maxGeoBuy, handleSelectGeoMax, defaultSendAmount } = this.props
      if (maxGeoBuy && maxGeoBuy < defaultSendAmount) {
        handleSelectGeoMax()
      }
    },
    componentWillUnmount() {
      const { saveSwapWidgetInputs, sendAsset, receiveAsset, 
        refundAddress, receiveAddress, sendAmount, receiveAmount } = this.props
      saveSwapWidgetInputs({
        to: receiveAsset ? receiveAsset.symbol : undefined,
        from: sendAsset ? sendAsset.symbol : undefined,
        fromAddress: refundAddress,
        toAddress: receiveAddress,
        fromAmount: sendAmount ? parseFloat(sendAmount) : undefined,
        toAmount: receiveAmount ? parseFloat(receiveAmount) : undefined
      })
    }
  }),
  debounceHandler('updateURLParams', DEBOUNCE_WAIT),
)(SwapStepOne)

import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector, SubmissionError } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import {
  Form, Button, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText, Alert
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import * as qs from 'query-string'
import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'
import { saveSwapWidgetInputs } from 'Actions/app'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, 
  getRateMaximumDeposit, rateError, getRateWithdrawalFee, isRateStale } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit, getSavedSwapWidgetInputs } from 'Selectors/app'
import extraAssetFields from 'Config/extraAssetFields'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Src/app/components/AssetSelectorList'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
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
  inputClass: classNames(inputClass),
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
  sendWallet, receiveWallet, maxGeoBuy, handleSelectGeoMax, receiveAsset, ethReceiveBalanceAmount,
  onChangeReceiveAmount, estimatedField, sendAmount, receiveAmount, previousSwapInputs = {},
  onChangeRefundAddress, onChangeReceiveAddress, rateError, sendAsset, t, onCloseAssetSelector,
  validateDepositTag
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
        style={{ width: '100%', height: '100%', top: 0, left: 0, zIndex: 99 }}
      ></div>
    )}
    {!balancesLoaded ? (
      <LoadingFullscreen label={<T tag='span' i18nKey='app.loading.balances'>Loading balances...</T>} />
    ) : (
      <Form onSubmit={handleSubmit}>
        <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
          <CardHeader className='text-center'>
            <T tag='h4' i18nKey='app.widget.swapInstantly' className='my-1'>Swap Instantly</T>
          </CardHeader>
          <CardBody className='pt-3'>
            <Row className='gutter-0'>
              <Col className='position-relative' xs={{ size: 12, order: 1 }} lg>
                {assetSelect === 'send' && (
                  <div className={style.assetListContainer}>
                    <AssetSelector 
                      walletId={sendWallet && sendWallet.id}
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
                    />
                  </div>
                )}
                <StepOneField
                  name='sendAmount'
                  type='number'
                  step='any'
                  placeholder={`${t('app.widget.sendAmountPlaceholder', 'Send amount')}${sendWallet ? '' : t('app.widget.optionalPlaceholder', ' (optional)')}`}
                  validate={validateSendAmount}
                  label={t('app.widget.youSend','You send')}
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
                {assetSelect === 'receive' && (
                  <div className={style.assetListContainer}>
                    <AssetSelector 
                      walletId={receiveWallet && receiveWallet.id}
                      selectAsset={handleSelectedAsset} 
                      supportedAssetSymbols={assetSymbols}
                      isAssetDisabled={isAssetDisabled}
                      onClose={onCloseAssetSelector}
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
                  placeholder={sendSymbol !== 'XMR' ? `${sendSymbol} ${t('app.widget.returnAddressOptionalPlaceholder', 'return address (optional)')}` : `${sendSymbol} ${t('app.widget.returnAddressPlaceholder','return address')}`}
                  label={t('app.widget.fromWallet', 'From wallet')}
                  labelClass='mt-3 mt-sm-0 mt-lg-3'
                  validate={validateRefundAddress}
                  symbol={sendSymbol}
                  change={change}
                  untouch={untouch}
                  defaultValue={!previousSwapInputs.sendWalletId ? previousSwapInputs.fromAddress : undefined}
                  formName={FORM_NAME}
                  onChange={onChangeRefundAddress}
                  requiredLabel={sendSymbol === 'XMR'}
                  disableNoBalance
                />
                {Object.keys(extraAssetFields).indexOf(sendSymbol) >= 0 && (
                  <StepOneField
                    name='extraRefundDepositField'
                    type='number'
                    step='any'
                    placeholder={`${sendSymbol} Refund ${capitalizeFirstLetter(extraAssetFields[sendSymbol].deposit)}`}
                    validate={validateDepositTag}
                    label={`${sendSymbol} Refund ${capitalizeFirstLetter(extraAssetFields[sendSymbol].deposit)}`}
                  />
                )}
              </Col>
              <Col lg={{ size: 1, order: 5 }}/>
              <Col xs={{ size: 12, order: 6 }} lg>
                <WalletSelectField 
                  tag={StepOneField}
                  addressFieldName='receiveAddress'
                  walletIdFieldName='receiveWalletId'
                  placeholder={`${receiveSymbol} ${t('app.widget.receiveAddressPlaceholder', 'receive address')}`}
                  label={t('app.widget.toWallet', 'To wallet')}
                  labelClass='mt-3 mt-sm-0 mt-lg-3'
                  validate={validateReceiveAddress}
                  symbol={receiveSymbol}
                  change={change}
                  defaultValue={!previousSwapInputs.receiveWalletId ? previousSwapInputs.toAddress : undefined}
                  untouch={untouch}
                  formName={FORM_NAME}
                  onChange={onChangeReceiveAddress}
                  requiredLabel
                  helpText={receiveAsset.ERC20 && parseFloat(ethReceiveBalanceAmount) === 0 && (
                    <FormText className='text-muted'>
                     Please note: The {receiveSymbol} you receive will be <a href='https://ethereum.stackexchange.com/questions/52937/cannot-send-erc20-tokens-because-user-has-no-ethereum' target='_blank noreferrer'>stuck upon arrival</a> because your receiving wallet does not have ETH to pay for future network fees.
                    </FormText>
                  )}
                />
                {Object.keys(extraAssetFields).indexOf(receiveSymbol) >= 0 && (
                  <StepOneField
                    name='extraWithdrawalField'
                    type='number'
                    step='any'
                    placeholder={`${receiveSymbol} ${capitalizeFirstLetter(extraAssetFields[receiveSymbol].deposit)}`}
                    validate={validateDepositTag}
                    label={`${receiveSymbol} ${capitalizeFirstLetter(extraAssetFields[receiveSymbol].deposit)}`}
                  />
                )}
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
            <GAEventButton 
              className={classNames('mt-2 mb-2 mx-auto', style.submitButton)} 
              color={rateError ? 'danger' : 'primary'} 
              type='submit' 
              event={{ category: 'Swap', action: 'Create Swap' }}
              disabled={Boolean(submitting || rateError)}
            >
              {!submitting && !rateError ? (
                <T tag='span' i18nKey='app.widget.createSwap'>Create Swap</T>
              ) : rateError ? (
                <T tag='span' i18nKey='app.widget.noRate'>Unable to retrieve rate</T>
              ) : (
                <T tag='span' i18nKey='app.widget.generatingSwap'>Generating Swap...</T>
              )}
            </GAEventButton>
          </CardBody>
        </Card>
      </Form>
    )}
  </Fragment>
)

export default compose(
  setDisplayName('SwapStepOne'),
  withTranslation(),
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
    receiveWallet: (state) => getWallet(state, getFormValue(state, 'receiveWalletId')),
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
    saveSwapWidgetInputs: saveSwapWidgetInputs,
  }),
  withProps(({
    sendSymbol, receiveSymbol,
    defaultSendAmount, defaultReceiveAmount,
    defaultRefundAddress, defaultReceiveAddress,
    sendWallet, sendAsset, limit, previousSwapInputs, receiveWallet,
  }) => { 
    const maxGeoBuy = limit && toBigNumber(limit.per_transaction.amount)
      .div(sendAsset.price).round(sendAsset.decimals, BigNumber.ROUND_DOWN)
    const { toAmount, fromAmount, toAddress, fromAddress, sendWalletId, receiveWalletId } = previousSwapInputs || {}
    return ({
      pair: `${sendSymbol}_${receiveSymbol}`,
      initialValues: {
        sendAmount: fromAmount ? parseFloat(fromAmount) : defaultSendAmount,
        receiveAmount: toAmount ? parseFloat(toAmount) : defaultReceiveAmount,
        refundWallet: sendWalletId ? 'hi' : fromAddress ? fromAddress : defaultRefundAddress,
        receiveWallet: receiveWalletId ? undefined : toAddress ? toAddress : defaultReceiveAddress,
        sendWalletId: sendWalletId ? sendWalletId : undefined,
        receiveWalletId: receiveWalletId ? receiveWalletId : undefined,
      },
      fullBalanceAmount: sendWallet && (sendWallet.balances[sendSymbol] || '0'),
      ethSendBalanceAmount: sendWallet && (sendWallet.balances['ETH'] || '0'),
      ethReceiveBalanceAmount: receiveWallet && (receiveWallet.balances['ETH'] || '0'),
      fullBalanceAmountLoaded: sendWallet && sendWallet.balancesLoaded,
      maxGeoBuy
    })}),
  connect(createStructuredSelector({
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    rateStale: (state, { pair }) => isRateStale(state, pair),
    minimumSend: (state, { pair }) => getRateMinimumDeposit(state, pair),
    maximumSend: (state, { pair }) => getRateMaximumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
    rateError: (state, { pair }) => rateError(state, pair),
    withdrawalFee: (state, { pair }) => getRateWithdrawalFee(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // send, receive, or null
  withState('estimatedField', 'setEstimatedField', 'receive'), // send or receive
  withHandlers({
    onCloseAssetSelector: ({ setAssetSelect }) => () => {
      setAssetSelect(null)
    },
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
    validateReceiveAddress: ({ receiveAsset, receiveSymbol, t }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset, `${t('app.widget.invalid', 'Invalid')} ${receiveSymbol} ${t('app.widget.address', 'address')}`)
    ),
    validateRefundAddress: ({ sendAsset, sendSymbol, t }) => validator.all(
      ...(sendAsset.symbol === 'XMR' ? [validator.required()] : []),
      validator.walletAddress(sendAsset, `${t('app.widget.invalid', 'Invalid')} ${sendSymbol} ${t('app.widget.address', 'address')}`)
    ),
    validateDepositTag: () => validator.all(
      validator.number(),
      validator.integer()
    ),
    onSubmit: ({
      sendSymbol, receiveAsset, sendAsset,
      createSwap, openViewOnly, push, estimatedField,
      ethSendBalanceAmount, t, fullBalanceAmount
    }) => async (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      let { sendAmount, receiveAddress, refundAddress, sendWalletId, receiveWalletId, receiveAmount, extraWithdrawalField, extraRefundDepositField } = values
      if (receiveSymbol == 'ETH' || ERC20) {
        receiveAddress = toChecksumAddress(receiveAddress)
      }
      if ((sendSymbol == 'ETH' || sendAsset.ERC20) && refundAddress) {
        refundAddress = toChecksumAddress(refundAddress)
      }
      if (sendAsset.ERC20 && parseFloat(ethSendBalanceAmount) === 0) {
        throw new SubmissionError({
          refundAddress: t('app.widget.notEnoughEth', 'This wallet does not have enough ETH to cover the gas fees. Please deposit some ETH and try again.'),
        })
      }
      if (sendSymbol === 'XRP' && toBigNumber(fullBalanceAmount).minus(toBigNumber(sendAmount)).lt(20)) {
        throw new SubmissionError({
          refundAddress: t('app.widget.notEnoughXrp', 'Unable to send because XRP wallets must have a balance of 20 XRP.'),
        })
      }
      try {
        const receiveValidation = await Faast.validateAddress(receiveAddress, receiveSymbol)
        if (!receiveValidation.valid) {
          throw `${t('app.widget.invalid', 'Invalid')} ${receiveSymbol} ${t('app.widget.address', 'address')}`
        } 
        // else if (receiveValidation.valid && receiveAddress !== receiveValidation.standardized) {
        //   throw `Invalid ${receiveSymbol} address format. Here is your address converted to the correct format: ${receiveValidation.standardized}`
        // }
      } catch (err) {
        throw new SubmissionError({
          receiveAddress: err,
        })
      }
      try { 
        if (refundAddress) {
          const sendValidation = await Faast.validateAddress(refundAddress, sendSymbol) || {}
          if (!sendValidation.valid) {
            throw `${t('app.widget.invalid', 'Invalid')} ${sendSymbol} ${t('app.widget.address', 'address')}`
          } 
          // else if (sendValidation.valid && refundAddress !== sendValidation.standardized) {
          //   throw `Invalid ${sendSymbol} address format. Here is your address converted to the correct format: ${sendValidation.standardized}`
          // }
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
        receiveAmount: sendAmount && estimatedField !== 'receive' ? toBigNumber(receiveAmount).round(receiveAsset.decimals) : undefined,
        extraWithdrawalField,
        extraRefundDepositField
      })
        .then((swap) => {
          push(`/swap/send?id=${swap.orderId}`)
          if (receiveSymbol === 'ETH' || ERC20) { 
            return openViewOnly(receiveAddress, `/swap/send?id=${swap.orderId}`)
          }
        })
    },
    handleSaveSwapWidgetInputs: ({ saveSwapWidgetInputs, receiveAsset, sendAsset, 
      receiveAddress, refundAddress, receiveAmount, sendAmount, sendWallet, receiveWallet }) => (inputs) => {
      const { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId } = inputs
      saveSwapWidgetInputs({
        to: to ? to : receiveAsset.symbol,
        from: from ? from : sendAsset.symbol,
        toAddress: toAddress ? toAddress : receiveAddress,
        fromAddress: fromAddress ? fromAddress : refundAddress,
        toAmount: toAmount ? toAmount : receiveAmount ? parseFloat(receiveAmount) : undefined,
        fromAmount: fromAmount ? fromAmount : sendAmount ? parseFloat(sendAmount) : undefined,
        sendWalletId: sendWalletId ? sendWalletId : sendWallet ? sendWallet.id : undefined,
        receiveWalletId: receiveWalletId ? receiveWalletId : receiveWallet ? receiveWallet.id : undefined,
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
        receiveAsset, estimatedRate, setEstimatedField, updateURLParams, sendAsset, withdrawalFee
      }) => (sendAmount) => {
        if (estimatedRate && sendAmount) {
          sendAmount = toBigNumber(sendAmount).round(sendAsset.decimals)
          console.log('receive amount', sendAmount.div(estimatedRate).round(receiveAsset.decimals).toString())
          console.log('withdrawal fee', withdrawalFee)
          const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(receiveAsset.decimals).minus(toBigNumber(withdrawalFee))
          console.log('minus', estimatedReceiveAmount.toString())
          updateURLParams({ 
            toAmount: estimatedReceiveAmount ? parseFloat(estimatedReceiveAmount) : null,
            fromAmount: sendAmount ? parseFloat(sendAmount) : null,
            to: receiveAsset.symbol,
            from: sendAsset.symbol
          })
          setEstimatedReceiveAmount(estimatedReceiveAmount.toString())
        } else {
          updateURLParams({ 
            toAmount: '',
            fromAmount: ''
          })
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
            fromAmount: estimatedSendAmount ? parseFloat(estimatedSendAmount) : null,
            toAmount: receiveAmount ? parseFloat(receiveAmount) : null,
            to: receiveAsset.symbol,
            from: sendAsset.symbol
          })
          setEstimatedSendAmount(estimatedSendAmount.toString())
        } else {
          updateURLParams({ 
            fromAmount: '',
            toAmount: ''
          })
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
      console.log('on change send address')
      updateURLParams({ fromAddress: newRefundAddress })
    },
    onChangeReceiveAddress: ({ updateURLParams }) => (_, newReceiveAddress) => {
      updateURLParams({ toAddress: newReceiveAddress })
    },
    validateSendAmount: ({ minimumSend, maximumSend, sendAsset,
      sendSymbol, sendWallet, fullBalanceAmount, maxGeoBuy, handleSelectGeoMax, handleSelectMinimum,
      handleSelectMaximum, t }) => {
      return (
        validator.all(
          ...(sendWallet ? [validator.required()] : []),
          validator.number(),
          ...(minimumSend ? [validator.gte(minimumSend, <span key={'minimumSend'}>{t('app.widget.sendAmountAtLeast', 'Send amount must be at least')} <Button key={'minimumSend1'} color='link-plain' onClick={handleSelectMinimum}>
            <Units key={'minimumSend2'} precision={sendAsset.decimals} roundingType='dp' value={minimumSend}/>
          </Button> {sendSymbol} </span>)] : []),
          ...(maxGeoBuy ? [validator.lte(maxGeoBuy, <span key={Math.random()}>{t('app.widget.sendAmountGreaterThan', 'Send amount cannot be greater than')} <Button color='link-plain' onClick={handleSelectGeoMax}>
            <Units precision={sendAsset.decimals} roundingType='dp' value={maxGeoBuy}/>
          </Button> {sendSymbol} <a key={Math.random()} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>{t('app.widget.dueToYourLocation', 'due to your location.')}</a></span>)] : []),
          ...(sendWallet ? [validator.lte(fullBalanceAmount, t('app.widget.cannotSendMoreThanHave', 'Cannot send more than you have.'))] : []),
          ...(maximumSend ? [validator.lte(maximumSend, <span key={'maxSend'}>{t('app.widget.sendAmountGreaterThan', 'Send amount cannot be greater than')} <Button key={'maxSend1'} color='link-plain' onClick={handleSelectMaximum}>
            <Units key={'maxSend2'} precision={sendAsset.decimals} roundingType='dp' value={maximumSend}/></Button> {t('app.widget.ensurePricing', 'to ensure efficient pricing.')}</span>)] : []),
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
        previousSwapInputs, updateURLParams, fullBalanceAmount, fullBalanceAmountLoaded, maxGeoBuy, setSendAmount,
        rateStale
      } = this.props
      const urlParams = checkQueryParams()
      if (Object.keys(urlParams).length === 0 && previousSwapInputs) {
        updateURLParams(previousSwapInputs)
      }
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
      if (fullBalanceAmountLoaded !== prevProps.fullBalanceAmountLoaded && maxGeoBuy > fullBalanceAmount && fullBalanceAmount > 0) {
        setSendAmount(fullBalanceAmount)
      }
    },
    componentWillMount() {
      const { updateURLParams, sendSymbol, receiveSymbol, estimatedField, retrievePairData, pair, sendAmount, receiveAmount } = this.props
      if (sendSymbol === receiveSymbol) {
        let from = DEFAULT_SEND_SYMBOL
        let to = DEFAULT_RECEIVE_SYMBOL
        if (to === sendSymbol || from === receiveSymbol) {
          from = to
          to = DEFAULT_SEND_SYMBOL
        }
        updateURLParams({ to, from })
      } else {
        retrievePairData(pair, null, estimatedField === 'receive' ? sendAmount : undefined, estimatedField === 'send' ? receiveAmount : undefined)
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
        refundAddress, receiveAddress, sendAmount, receiveAmount,
        sendWallet, receiveWallet } = this.props
      saveSwapWidgetInputs({
        to: receiveAsset ? receiveAsset.symbol : undefined,
        from: sendAsset ? sendAsset.symbol : undefined,
        fromAddress: refundAddress ? refundAddress : undefined,
        toAddress: receiveAddress ? receiveAddress : undefined,
        sendWalletId: sendWallet ? sendWallet.id : undefined,
        receiveWalletId: receiveWallet ? receiveWallet.id : undefined,
        fromAmount: sendAmount ? parseFloat(sendAmount) : undefined,
        toAmount: receiveAmount ? parseFloat(receiveAmount) : undefined
      })
    }
  }),
  debounceHandler('updateURLParams', DEBOUNCE_WAIT),
)(SwapStepOne)

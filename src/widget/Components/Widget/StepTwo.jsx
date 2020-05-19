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
  Form, Button, Card, CardHeader, CardBody, Row, Col,
  FormText
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

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumWithdrawal,
  getRateMaximumDeposit, rateError, isRateStale, getRateMinimumWithdrawal } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit, getSavedSwapWidgetInputs } from 'Selectors/app'
import extraAssetFields from 'Config/extraAssetFields'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import { toChecksumAddress } from 'Utilities/convert'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import debounceHandler from 'Hoc/debounceHandler'

import ProgressBar from '../ProgressBar'

import style from './style.scss'
import Faast from 'Src/services/Faast'

const DEFAULT_SEND_SYMBOL = 'BTC'
const DEFAULT_RECEIVE_SYMBOL = 'ETH'
const DEFAULT_SEND_AMOUNT = 1
const FORM_NAME = 'swapWidget'
const DEBOUNCE_WAIT = 5000 // ms

const getFormValue = formValueSelector(FORM_NAME)

const StepOneField = withProps(({ labelClass, inputClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass, style.customLabel),
  inputClass: classNames('flat', style.customInput),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', sm: '3', md: '2', lg: '12', className: 'text-left text-sm-right text-lg-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapStepTwo = ({
  change, untouch, balancesLoaded,
  sendSymbol, receiveSymbol, validateReceiveAddress, validateRefundAddress,
  handleSubmit, receiveAsset, ethReceiveBalanceAmount, previousSwapInputs = {},
  onChangeRefundAddress, onChangeReceiveAddress, rateError, sendAsset, t,
  validateDepositTag, isSubmittingSwap
}) => {
  return (
    <Fragment>
      {!balancesLoaded ? (
        <LoadingFullscreen label={<T tag='span' i18nKey='app.loading.balances'>Loading balances...</T>} />
      ) : (
        <Form onSubmit={handleSubmit}>
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
                currentStep={1}
              />
              <Row className='gutter-0'>
                <Col className='position-relative' xs={{ size: 12, order: 1 }} lg>
                  <StepOneField 
                    name='refundAddress'
                    placeholder={`${sendSymbol} ${t('app.widget.refundAddressPlaceholder', 'refund address')}`}
                    label={t('app.widget.refundAddress', 'Refund address')}
                    labelClass='mt-3 mt-sm-0 mt-lg-3'
                    validate={validateRefundAddress}
                    symbol={sendSymbol}
                    change={change}
                    defaultValue={!previousSwapInputs.receiveWalletId ? previousSwapInputs.toAddress : undefined}
                    untouch={untouch}
                    formName={FORM_NAME}
                    onChange={onChangeRefundAddress}
                    requiredLabel
                    helpText={sendAsset.ERC20 && parseFloat(ethReceiveBalanceAmount) === 0 && (
                      <FormText className='text-muted'>
                     Please note: The {receiveSymbol} you receive will be <a href='https://ethereum.stackexchange.com/questions/52937/cannot-send-erc20-tokens-because-user-has-no-ethereum' target='_blank noreferrer'>stuck upon arrival</a> because your receiving wallet does not have ETH to pay for future network fees.
                      </FormText>
                    )}
                  />
                  {Object.keys(extraAssetFields).indexOf(sendSymbol) >= 0 && (
                    <StepOneField
                      name='refundAddressExtraId'
                      type='number'
                      step='any'
                      fixedFeedback
                      placeholder={`${sendSymbol} ${capitalizeFirstLetter(extraAssetFields[sendSymbol].deposit)}`}
                      validate={validateDepositTag}
                      label={`${sendSymbol} ${capitalizeFirstLetter(extraAssetFields[sendSymbol].deposit)}`}
                    />
                  )}
                </Col>
                <Col className='position-relative' xs={{ size: 12, order: 1 }} lg={{ size: 12, order: 3 }}>
                  <StepOneField 
                    tag={StepOneField}
                    name='receiveAddress'
                    placeholder={`${receiveSymbol} ${t('app.widget.receiveAddressPlaceholder', 'receive address')}`}
                    label={t('app.widget.receiveAddress', 'Receive Address')}
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
                      name='receiveAddressExtraId'
                      type='number'
                      step='any'
                      fixedFeedback
                      placeholder={`${receiveSymbol} ${capitalizeFirstLetter(extraAssetFields[receiveSymbol].deposit)}`}
                      validate={validateDepositTag}
                      label={`${receiveSymbol} ${capitalizeFirstLetter(extraAssetFields[receiveSymbol].deposit)}`}
                    />
                  )}
                </Col>
              </Row>
              <GAEventButton 
                className={classNames('mt-2 mb-0 mx-auto', style.customButton)} 
                color={rateError ? 'danger' : 'primary'} 
                type='submit' 
                event={{ category: 'Swap', action: 'Create Swap' }}
                disabled={Boolean(isSubmittingSwap || rateError)}
              >
                {!isSubmittingSwap && !rateError ? (
                  <T tag='span' i18nKey='app.widget.createSwap'>Create Swap</T>
                ) : rateError ? (
                  <T tag='span' i18nKey='app.widget.noRate'>Unable to retrieve rate</T>
                ) : (
                  <T tag='span' i18nKey='app.widget.generatingSwap'>Generating Swap...</T>
                )}
              </GAEventButton>
            </CardBody>
            <div style={{ color: '#B5BCC4' }} className='text-center font-xs mb-3'>
              <span>powered by Faa.st</span>
            </div>
          </Card>
        </Form>
      )}
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapStepTwo'),
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
    validateReceiveAddress: ({ receiveAsset, receiveSymbol, t }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset, `${t('app.widget.invalid', 'Invalid')} ${receiveSymbol} ${t('app.widget.address', 'address')}`)
    ),
    validateRefundAddress: ({ sendAsset, sendSymbol, t }) => validator.all(
      ...(sendSymbol === 'XMR' ? [validator.required()] : []),
      validator.walletAddress(sendAsset, `${t('app.widget.invalid', 'Invalid')} ${sendSymbol} ${t('app.widget.address', 'address')}`)
    ),
    validateDepositTag: () => validator.all(
      validator.number(),
      validator.integer()
    ),
    onSubmit: ({
      sendSymbol, receiveAsset, sendAsset,
      createSwap, openViewOnly, push, estimatedField,
      ethSendBalanceAmount, t, fullBalanceAmount,updateIsSubmittingSwap
    }) => async (values) => {
      updateIsSubmittingSwap(true)
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      let { sendAmount, receiveAddress, refundAddress, sendWalletId, receiveAmount, receiveWalletId, receiveAddressExtraId, refundAddressExtraId } = values
      if (receiveSymbol == 'ETH' || ERC20) {
        receiveAddress = toChecksumAddress(receiveAddress)
      }
      if ((sendSymbol == 'ETH' || sendAsset.ERC20) && refundAddress) {
        refundAddress = toChecksumAddress(refundAddress)
      }
      if (sendAsset.ERC20 && parseFloat(ethSendBalanceAmount) === 0) {
        updateIsSubmittingSwap(false)
        throw new SubmissionError({
          refundAddress: t('app.widget.notEnoughEth', 'This wallet does not have enough ETH to cover the gas fees. Please deposit some ETH and try again.'),
        })
      }
      if (sendSymbol === 'XRP' && sendWalletId && toBigNumber(fullBalanceAmount).minus(toBigNumber(sendAmount)).lt(20)) {
        updateIsSubmittingSwap(false)
        throw new SubmissionError({
          refundAddress: t('app.widget.notEnoughXrp', 'XRP wallets must maintain a minimum balance of 20 XRP.'),
        })
      }
      async function validatePayportField(addressFieldName, extraIdFieldName, asset, address, extraId) {
        const validation = await Faast.validateAddress(address, asset.symbol, extraId)
        if (!validation.valid) {
          let message = `${t('app.widget.invalid', 'Invalid')} ${asset.symbol} ${t('app.widget.address', 'address')}`
          if (validation.message) {
            if (validation.message.includes('extraId is required')) {
              const extraIdName = extraAssetFields[asset.symbol].deposit || 'extra ID'
              updateIsSubmittingSwap(false)
              throw new SubmissionError({
                [extraIdFieldName]: `${asset.name} ${extraIdName} is required for this address`,
              })
            } else {
              message += `: ${validation.message}`
            }
          }
          updateIsSubmittingSwap(false)
          throw new SubmissionError({
            [addressFieldName]: message,
          })
        } 
      }
      await validatePayportField('receiveAddress', 'receiveAddressExtraId', receiveAsset, receiveAddress, receiveAddressExtraId)
      if (refundAddress) {
        await validatePayportField('refundAddress', 'refundAddressExtraId', sendAsset, refundAddress, refundAddressExtraId)
      }
      return createSwap({
        sendSymbol: sendSymbol,
        sendAmount: sendAmount && estimatedField !== 'send' ? toBigNumber(sendAmount).round(sendAsset.decimals) : undefined,
        sendWalletId,
        receiveSymbol,
        receiveAddress,
        refundAddress,
        receiveWalletId,
        receiveAmount: sendAmount && estimatedField !== 'receive' ? toBigNumber(receiveAmount).round(receiveAsset.decimals) : undefined,
        receiveAddressExtraId,
        refundAddressExtraId
      })
        .then((swap) => {
          updateIsSubmittingSwap(false)
          push(`/swap/send?id=${swap.orderId}`)
          if (receiveSymbol === 'ETH' || ERC20) { 
            return openViewOnly(receiveAddress, `/swap/send?id=${swap.orderId}`)
          }
        }).catch(() => updateIsSubmittingSwap(false))
    },
    handleSaveSwapWidgetInputs: ({ saveSwapWidgetInputs, receiveAsset, sendAsset, 
      receiveAddress, refundAddress, receiveAmount, sendAmount, sendWallet, receiveWallet }) => (inputs) => {
      // const { to, from, toAddress, fromAddress, toAmount, fromAmount, sendWalletId, receiveWalletId } = inputs
      // saveSwapWidgetInputs({
      //   to: to ? to : receiveAsset.symbol,
      //   from: from ? from : sendAsset.symbol,
      //   toAddress: toAddress ? toAddress : receiveAddress,
      //   fromAddress: fromAddress ? fromAddress : refundAddress,
      //   toAmount: toAmount ? toAmount : receiveAmount ? parseFloat(receiveAmount) : undefined,
      //   fromAmount: fromAmount ? fromAmount : sendAmount ? parseFloat(sendAmount) : undefined,
      //   sendWalletId: sendWalletId ? sendWalletId : sendWallet ? sendWallet.id : undefined,
      //   receiveWalletId: receiveWalletId ? receiveWalletId : receiveWallet ? receiveWallet.id : undefined,
      // })
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
      // updateQueryString(params)
      // handleSaveSwapWidgetInputs(params)
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
    handleSelectFullBalance: ({ fullBalanceAmount, setSendAmount }) => () => {
      setSendAmount(fullBalanceAmount)
    },
  }),
  withHandlers({
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
      handleSelectMaximum, t, handleSelectFullBalance, estimatedField }) => {
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
          ...(sendWallet ? [validator.lte(fullBalanceAmount, <span key='moreThan'>{t('app.widget.cannotSendMoreThanHave', 'Cannot send more than you have.')} <span>You have </span><Button color='link-plain' onClick={handleSelectFullBalance}>
            <Units precision={sendAsset.decimals} roundingType='dp' value={fullBalanceAmount}/>
          </Button> {sendSymbol} </span>)] : []),
          ...(estimatedField === 'receive' && maximumSend ? [validator.lte(maximumSend, <span key={'maxSend'}>{t('app.widget.sendAmountGreaterThan', 'Send amount cannot be greater than')} <Button key={'maxSend1'} color='link-plain' onClick={handleSelectMaximum}>
            <Units key={'maxSend2'} precision={sendAsset.decimals} roundingType='dp' value={maximumSend}/></Button> {t('app.widget.ensurePricing', 'to ensure efficient pricing.')}</span>)] : []),
        )
      )
    },
    validateETHAmount: ({ sendSymbol, ethSendBalanceAmount }) => {
      return (
        validator.all(
          ...(sendSymbol === 'ETH' ? [validator.lt(ethSendBalanceAmount, <span key='cannotSendWhole'>You are unable to send your entire ETH balance, because some ETH is needed to pay network fees.</span>)] : []),
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
      if (fullBalanceAmountLoaded !== prevProps.fullBalanceAmountLoaded && maxGeoBuy > fullBalanceAmount) {
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
        fromAddress: refundAddress,
        toAddress: receiveAddress,
        sendWalletId: sendWallet ? sendWallet.id : undefined,
        receiveWalletId: receiveWallet ? receiveWallet.id : undefined,
        fromAmount: sendAmount ? parseFloat(sendAmount) : undefined,
        toAmount: receiveAmount ? parseFloat(receiveAmount) : undefined
      })
    }
  }),
  debounceHandler('updateURLParams', DEBOUNCE_WAIT),
)(SwapStepTwo)

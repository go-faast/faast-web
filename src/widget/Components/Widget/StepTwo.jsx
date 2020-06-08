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
import { saveSwapWidgetInputs } from 'Actions/app'
import { getSavedSwapWidgetInputs } from 'Selectors/app'
import extraAssetFields from 'Config/extraAssetFields'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import Units from 'Components/Units'
import { toChecksumAddress } from 'Utilities/convert'
import debounceHandler from 'Hoc/debounceHandler'

import ProgressBar from '../ProgressBar'

import style from './style.scss'
import Faast from 'Src/services/Faast'

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
  change, untouch,
  sendSymbol, receiveSymbol, validateReceiveAddress, validateRefundAddress,
  handleSubmit, receiveAsset, ethReceiveBalanceAmount, previousSwapInputs = {},
  onChangeRefundAddress, onChangeReceiveAddress, rateError, sendAsset, t,
  validateDepositTag, isSubmittingSwap
}) => {
  return (
    <Fragment>
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
    </Fragment>
  )}

export default compose(
  setDisplayName('SwapStepTwo'),
  withTranslation(),
  setPropTypes({
    sendSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
  }),
  defaultProps({
    sendSymbol: undefined,
    receiveSymbol: undefined
  }),
  connect(createStructuredSelector({
    refundAddress: (state) => getFormValue(state, 'refundAddress'),
    receiveAddress: (state) => getFormValue(state, 'receiveAddress'),
    sendAsset: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    receiveWallet: (state) => getWallet(state, getFormValue(state, 'receiveWalletId')),
    sendWallet: (state) => getWallet(state, getFormValue(state, 'sendWalletId')),
    previousSwapInputs: getSavedSwapWidgetInputs
  }), {
    createSwap: createSwapAction,
    push: pushAction,
    saveSwapWidgetInputs: saveSwapWidgetInputs,
  }),
  withState('isSubmittingSwap', 'updateIsSubmittingSwap', false),
  withHandlers({
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
      createSwap, openViewOnly, push, estimatedField, t, updateIsSubmittingSwap
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
        sendAmount: sendAmount && toBigNumber(sendAmount).round(sendAsset.decimals),
        receiveSymbol,
        receiveAddress,
        refundAddress,
        receiveAddressExtraId,
        refundAddressExtraId
      })
        .then((swap) => {
          updateIsSubmittingSwap(false)
          saveSwapWidgetInputs({
            fromAddress: refundAddress,
            toAddress: receiveAddress,
          })
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
  withHandlers(({ change }) => {
    const setEstimatedReceiveAmount = (x) => {
      log.trace('setEstimatedReceiveAmount', x)
      change('receiveAmount', x && toBigNumber(x))
    }
  }),
  withHandlers({
    onChangeRefundAddress: ({ updateURLParams }) => (_, newRefundAddress) => {
      updateURLParams({ fromAddress: newRefundAddress })
    },
    onChangeReceiveAddress: ({ updateURLParams }) => (_, newReceiveAddress) => {
      updateURLParams({ toAddress: newReceiveAddress })
    },
  }),
  debounceHandler('updateURLParams', DEBOUNCE_WAIT),
)(SwapStepTwo)

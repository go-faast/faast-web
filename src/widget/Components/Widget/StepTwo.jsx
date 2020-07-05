import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector, SubmissionError } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Form, Card, CardHeader, CardBody, Row, Col } from 'reactstrap'

import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'
import { capitalizeFirstLetter } from 'Utilities/helpers'
import { createSwap as createSwapAction } from 'Actions/swap'
import { saveSwapWidgetInputs, updateCreatedSwap } from 'Actions/widget'
import { getAsset } from 'Common/selectors/asset'
import { getSavedSwapWidgetInputs } from 'Selectors/widget'
import extraAssetFields from 'Config/extraAssetFields'

import GAEventButton from 'Components/GAEventButton'
import ReduxFormField from 'Components/ReduxFormField'
import T from 'Components/i18n/T'
import { withTranslation } from 'react-i18next'
import { toChecksumAddress } from 'Utilities/convert'

import ProgressBar from '../ProgressBar'

import style from './style.scss'
import Faast from 'Src/services/Faast'

const FORM_NAME = 'swapWidget'

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
  change, untouch, sendSymbol, receiveSymbol, validateReceiveAddress, validateRefundAddress,
  handleSubmit, previousSwapInputs = {}, rateError, t, validateDepositTag, isSubmittingSwap
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
                  text: `Send ${sendSymbol}`
                },
                {
                  text: `Receive ${receiveSymbol}`
                },
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
                  requiredLabel
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
                  requiredLabel
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
            <span>powered by <a href='https://faa.st' target='_blank noreferrer'>Faa.st</a></span>
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
    previousSwapInputs: getSavedSwapWidgetInputs
  }), {
    createSwap: createSwapAction,
    push: pushAction,
    saveSwapWidgetInputs: saveSwapWidgetInputs,
    updateCreatedSwap
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
      sendSymbol, receiveAsset, sendAsset, saveSwapWidgetInputs,
      createSwap, t, updateIsSubmittingSwap, updateCreatedSwap, previousSwapInputs
    }) => async (values) => {
      updateIsSubmittingSwap(true)
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const sendAmount = previousSwapInputs && previousSwapInputs.fromAmount
      let { receiveAddress, refundAddress, receiveAddressExtraId, refundAddressExtraId } = values
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
          updateCreatedSwap(swap)
          saveSwapWidgetInputs({
            ...previousSwapInputs,
            fromAddress: refundAddress,
            toAddress: receiveAddress,
          })
        }).catch(() => updateIsSubmittingSwap(false))
    }
  }),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(SwapStepTwo)

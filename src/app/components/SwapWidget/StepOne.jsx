import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import {
  Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText, Alert
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'

import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded, getRateMaximumDeposit } from 'Selectors/rate'
import { getAllAssetSymbols, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'
import { areCurrentPortfolioBalancesLoaded } from 'Selectors/portfolio'
import { getGeoLimit } from 'Selectors/app'

import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import Units from 'Components/Units'
import LoadingFullscreen from 'Components/LoadingFullscreen'

import SwapIcon from 'Img/swap-icon.svg?inline'

import style from './style.scss'

const DEFAULT_SEND_SYMBOL = 'BTC'
const DEFAULT_RECEIVE_SYMBOL = 'ETH'
const DEFAULT_SEND_AMOUNT = 1
const FORM_NAME = 'swapWidget'

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
  onChangeSendAmount, handleSelectMax, maxSendAmount, maxSendAmountLoaded,
  sendWallet, defaultRefundAddress, defaultReceiveAddress, maxGeoBuy, handleSelectGeoMax,
  onChangeReceiveAmount, estimatedField, sendAmount, receiveAmount
}) => (
  <Fragment>
    <ProgressBar steps={['Create Swap', `Send ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={0}/>
    {maxGeoBuy && (
      <Alert color='info' className='mx-auto mt-3 w-75 text-center'>
        <small>
      Please note: The maximum you can send is <Button style={{ color: 'rgba(0, 255, 222, 1)' }} color='link-plain' onClick={handleSelectGeoMax}><Units precision={8} roundingType='dp' value={maxGeoBuy}/></Button> {sendSymbol} <a style={{ color: 'rgba(0, 255, 222, 1)' }} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noreferrer noopener'>due to your location.</a>
        </small>
      </Alert>
    )}
    <Form onSubmit={handleSubmit}>
      <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
        {!balancesLoaded && (
          <LoadingFullscreen label='Loading balances...'/>
        )}
        <CardHeader className='text-center'>
          <h4 className='my-1'>Swap Instantly</h4>
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
                    You have {maxSendAmountLoaded ? (
                      <Button color='link-plain' onClick={handleSelectMax}>
                        <Units precision={8} roundingType='dp' value={maxSendAmount}/>
                      </Button>
                    ) : (
                      <i className='fa fa-spinner fa-pulse'/>
                    )} {sendSymbol}
                  </FormText>
                ) : !sendAmount ? (
                  <FormText color="muted">When omitted, a variable market rate is used.</FormText>
                ) : estimatedField === 'send' ? (
                  <FormText color="muted">Approximately how much you need to send. Click Create to receive a guaranteed quote.</FormText>
                ) : (
                  <FormText color="muted">The amount we expect you to send.</FormText>
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
                  <FormText color="muted">Approximately how much you will receive. Click Create to receive a guaranteed quote.</FormText>
                ) : !receiveAmount ? (
                  null
                ) : (
                  <FormText color="muted">The amount you are guaranteed to receive.</FormText>
                )}
              />
            </Col>
            <div className='w-100 order-3'/>
            <Col xs={{ size: 12, order: 2 }} lg={{ size: true, order: 4 }}>
              <WalletSelectField
                tag={StepOneField}
                addressFieldName='refundAddress'
                walletIdFieldName='sendWalletId'
                placeholder={`${sendSymbol} return address (optional)`}
                label='From wallet'
                labelClass='mt-3 mt-sm-0 mt-lg-3'
                validate={validateRefundAddress}
                symbol={sendSymbol}
                change={change}
                untouch={untouch}
                defaultValue={defaultRefundAddress}
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
                defaultValue={defaultReceiveAddress}
                untouch={untouch}
                requiredLabel
              />
            </Col>
          </Row>
          <div className='mt-2 mb-4'>
            <Checkbox
              label={
                <small className='pl-1 text-white'>I accept the 
                  <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faa.st Terms & Conditions</a>
                </small>
              }
              labelClass='p-0'
            />
          </div>
          <Button className={classNames('mt-2 mb-2 mx-auto', style.submitButton)} color='primary' type='submit' disabled={submitting}>
            {!submitting ? 'Create Swap' : 'Generating Swap...' }
          </Button>
        </CardBody>
      </Card>
    </Form>
    <Modal size='lg' isOpen={Boolean(assetSelect)} toggle={() => setAssetSelect(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
      <ModalHeader toggle={() => setAssetSelect(null)} tag='h4' className='text-primary'>
        Choose Asset to {assetSelect === 'send' ? 'Send' : 'Receive'}
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
    sendWallet: (state) => getWallet(state, getFormValue(state, 'sendWalletId')),
    balancesLoaded: areCurrentPortfolioBalancesLoaded,
    limit: getGeoLimit,
  }), {
    createSwap: createSwapAction,
    push: pushAction,
    updateQueryString: updateQueryStringReplace,
    retrievePairData: retrievePairData,
    openViewOnly: openViewOnlyWallet,
  }),
  withProps(({
    sendSymbol, receiveSymbol,
    defaultSendAmount, defaultReceiveAmount,
    defaultRefundAddress, defaultReceiveAddress,
    sendWallet, sendAsset, limit
  }) => { 
    const maxGeoBuy = limit ? limit.per_transaction.amount / parseFloat(sendAsset.price) : undefined
    return ({
      pair: `${sendSymbol}_${receiveSymbol}`,
      initialValues: {
        sendAmount: defaultSendAmount,
        receiveAmount: defaultReceiveAmount,
        refundAddress: defaultRefundAddress,
        receiveAddress: defaultReceiveAddress,
      },
      maxSendAmount: sendWallet && (sendWallet.balances[sendSymbol] || '0'),
      maxSendAmountLoaded: sendWallet && sendWallet.balancesLoaded,
      maxGeoBuy
    })}),
  connect(createStructuredSelector({
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    minimumSend: (state, { pair }) => getRateMinimumDeposit(state, pair),
    maximumSend: (state, { pair }) => getRateMaximumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // send, receive, or null
  withState('estimatedField', 'setEstimatedField', 'receive'), // send or receive
  withHandlers({
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
    handleSwitchAssets: ({ updateQueryString, sendSymbol, receiveSymbol }) => () => {
      updateQueryString({ from: receiveSymbol, to: sendSymbol })
    },
    validateReceiveAddress: ({ receiveAsset }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset)
    ),
    validateRefundAddress: ({ sendAsset }) => validator.walletAddress(sendAsset),
    onSubmit: ({
      sendSymbol, receiveAsset, 
      createSwap, openViewOnly, push, estimatedField
    }) => (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { sendAmount, receiveAddress, refundAddress, sendWalletId, receiveWalletId, receiveAmount } = values

      return createSwap({
        sendSymbol: sendSymbol,
        sendAmount: sendAmount && estimatedField === 'send' ? toBigNumber(sendAmount) : undefined,
        sendWalletId,
        receiveSymbol,
        receiveWalletId,
        receiveAddress,
        refundAddress,
        receiveAmount: sendAmount && estimatedField === 'receive' ? toBigNumber(receiveAmount) : undefined
      })
        .then((swap) => {
          push(`/swap/send?id=${swap.orderId}`)
          if (receiveSymbol === 'ETH' || ERC20) { 
            return openViewOnly(receiveAddress, null)
          }
        })
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
      log.debugInline('setEstimatedReceiveAmount', x)
      change('receiveAmount', toBigNumber(x).toString())
    }
    const setEstimatedSendAmount = (x) => {
      log.debugInline('setEstimatedSendAmount', x)
      change('sendAmount', toBigNumber(x).toString())
    }
    return {
      calculateReceiveEstimate: ({
        receiveAsset, estimatedRate, setEstimatedField,
      }) => (sendAmount) => {
        if (estimatedRate && sendAmount) {
          sendAmount = toBigNumber(sendAmount)
          const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(receiveAsset.decimals)
          setEstimatedReceiveAmount(estimatedReceiveAmount.toString())
        } else {
          setEstimatedReceiveAmount(null)
        }
        setEstimatedField('receive')
      },
      calculateSendEstimate: ({
        sendAsset, estimatedRate, setEstimatedField,
      }) => (receiveAmount) => {
        if (estimatedRate && receiveAmount) {
          receiveAmount = toBigNumber(receiveAmount)
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
    setSendAmount: ({ change, touch, calculateReceiveEstimate }) => (x) => {
      log.debug('setSendAmount', x)
      change('sendAmount', toBigNumber(x).toString())
      touch('sendAmount')
      calculateReceiveEstimate(x)
    },
  }),
  withHandlers({
    handleSelectMax: ({ maxSendAmount, setSendAmount }) => () => {
      setSendAmount(maxSendAmount)
    },
    handleSelectGeoMax: ({ maxGeoBuy, setSendAmount }) => () => {
      setSendAmount(maxGeoBuy)
    },
    onChangeReceiveAmount: ({ calculateSendEstimate }) => (_, newReceiveAmount) => {
      calculateSendEstimate(newReceiveAmount)
    },
    onChangeSendAmount: ({ calculateReceiveEstimate }) => (_, newSendAmount) => {
      calculateReceiveEstimate(newSendAmount)
    },
    validateSendAmount: ({ minimumSend, maximumSend, 
      sendSymbol, sendWallet, maxSendAmount, maxGeoBuy, handleSelectGeoMax }) => {
      return (
        validator.all(
          ...(sendWallet ? [validator.required()] : []),
          validator.number(),
          ...(minimumSend ? [validator.gt(minimumSend, `Send amount must be at least ${minimumSend} ${sendSymbol}.`)] : []),
          ...(maxGeoBuy ? [validator.lte(maxGeoBuy, <span key={Math.random()}>Send amount cannot be greater than <Button color='link-plain' onClick={handleSelectGeoMax}>
            <Units precision={8} roundingType='dp' value={maxGeoBuy}/>
          </Button> {sendSymbol} <a key={Math.random()} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>due to your location.</a></span>)] : []),
          ...(maximumSend ? [validator.lte(maximumSend, `Send amount cannot be greater than ${maximumSend} ${sendSymbol} to ensure efficient pricing.`)] : []),
          ...(sendWallet ? [validator.lte(maxSendAmount, 'Cannot send more than you have.')] : []),
        )
      )
    },
    validateReceiveAmount: () => {
      return validator.number()
    },
    handleSelectedAsset: ({ assetSelect, updateQueryString, setAssetSelect, sendSymbol, receiveSymbol }) => (asset) => {
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
      updateQueryString({ from, to })
    },
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      const {
        rateLoaded, pair, retrievePairData, estimatedRate, calculateSendEstimate, 
        calculateReceiveEstimate, estimatedField, sendAmount, receiveAmount,
      } = this.props
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
      const { updateQueryString, sendSymbol, receiveSymbol, retrievePairData, pair } = this.props
      if (sendSymbol === receiveSymbol) {
        let from = DEFAULT_SEND_SYMBOL
        let to = DEFAULT_RECEIVE_SYMBOL
        if (to === sendSymbol || from === receiveSymbol) {
          from = to
          to = DEFAULT_SEND_SYMBOL
        }
        updateQueryString({ to, from })
      } else {
        retrievePairData(pair)
      }
     
    },
    componentDidMount() {
      const { maxGeoBuy, handleSelectGeoMax, defaultSendAmount } = this.props
      if (maxGeoBuy && maxGeoBuy < defaultSendAmount) {
        handleSelectGeoMax()
      }
    }
  }),
)(SwapStepOne)

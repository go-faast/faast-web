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
  validateReceiveAddress, validateRefundAddress, validateDepositAmount,
  handleSubmit, handleSelectedAsset, handleSwitchAssets, isAssetDisabled,
  onChangeDepositAmount, handleSelectMax, maxSendAmount, maxSendAmountLoaded,
  sendWallet, defaultRefundAddress, defaultReceiveAddress, maxGeoBuy, handleSelectGeoMax,
  onChangeReceiveAmount
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
                validate={validateDepositAmount}
                label='You send'
                onChange={onChangeDepositAmount}
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
                ) : (
                  <FormText color="muted">If omitted, a variable market rate is used.</FormText>
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
                placeholder='Estimated receive amount'
                label='You receive'
                onChange={onChangeReceiveAmount}
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType="append">
                    <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('receive')}>
                      <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                      {receiveSymbol} <i className='fa fa-caret-down'/>
                    </Button>
                  </InputGroupAddon>
                )}
                helpText={(
                  <FormText color="muted">Only an estimate. Not a guaranteed quote.</FormText>
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
    minimumDeposit: (state, { pair }) => getRateMinimumDeposit(state, pair),
    maximumDeposit: (state, { pair }) => getRateMaximumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // send, receive, or null
  withState('lastUpdatedField', 'setLastUpdatedField', 'send'), // send or receive
  withHandlers({
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'send' && deposit) || 
      (assetSelect === 'receive' && receive)),
    handleSwitchAssets: ({ updateQueryString, sendSymbol, receiveSymbol }) => () => {
      updateQueryString({ from: receiveSymbol, to: sendSymbol })
    },
    onChangeReceiveAmount: ({ setLastUpdatedField }) => () => {
      setLastUpdatedField('receive')
    },
    onChangeDepositAmount: ({ setLastUpdatedField }) => () => {
      setLastUpdatedField('send')
    },
    validateReceiveAddress: ({ receiveAsset }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset)
    ),
    validateRefundAddress: ({ sendAsset }) => validator.walletAddress(sendAsset),
    onSubmit: ({
      sendSymbol, receiveAsset, 
      createSwap, openViewOnly, push
    }) => (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { sendAmount, receiveAddress, refundAddress, sendWalletId, receiveWalletId } = values
      return createSwap({
        sendSymbol: sendSymbol,
        sendAmount: sendAmount ? toBigNumber(sendAmount) : undefined,
        sendWalletId,
        receiveSymbol,
        receiveWalletId,
        receiveAddress,
        refundAddress,
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
  withHandlers(({ change, touch }) => {
    const setEstimatedReceiveAmount = (x) => change('receiveAmount', x)
    const setEstimatedDepositAmount = (x) => change('sendAmount', x)
    const setDepositAmount = (x) => {
      change('sendAmount', log.debugInline('setDepositAmount', x))
      touch('sendAmount')
    }
    return {
      setDepositAmount,
      setEstimatedReceiveAmount,
      setEstimatedDepositAmount,
      handleSelectMax: ({ maxSendAmount }) => () => {
        setDepositAmount(maxSendAmount)
      },
      handleSelectGeoMax: ({ maxGeoBuy }) => () => {
        setDepositAmount(maxGeoBuy)
      },
      calculateReceiveAmount: ({ sendAmount, receiveAsset, estimatedRate, receiveAmount }) => () => {
        if (estimatedRate && sendAmount) {
          sendAmount = toBigNumber(sendAmount)
          const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(receiveAsset.decimals)
          setEstimatedReceiveAmount(estimatedReceiveAmount.toNumber())
        } else {
          setEstimatedReceiveAmount(null)
        }
        if (!sendAmount && !receiveAmount) {
          setEstimatedDepositAmount(1)
        }
      },
      calculateDepositAmount: ({ receiveAmount, sendAsset, estimatedRate }) => () => {
        if (estimatedRate && receiveAmount) {
          receiveAmount = toBigNumber(receiveAmount)
          const estimatedDepositAmount = receiveAmount.times(estimatedRate).round(sendAsset.decimals)
          setEstimatedDepositAmount(estimatedDepositAmount.toNumber())
        } else {
          setEstimatedDepositAmount(null)
        }
      }
    }
  }),
  withHandlers({
    validateDepositAmount: ({ minimumDeposit, maximumDeposit, 
      sendSymbol, sendWallet, maxSendAmount, maxGeoBuy, handleSelectGeoMax }) => {
      return (
        validator.all(
          ...(sendWallet ? [validator.required()] : []),
          validator.number(),
          ...(minimumDeposit ? [validator.gt(minimumDeposit, `Send amount must be at least ${minimumDeposit} ${sendSymbol}.`)] : []),
          ...(maxGeoBuy ? [validator.lte(maxGeoBuy, <span key={Math.random()}>Send amount cannot be greater than <Button color='link-plain' onClick={handleSelectGeoMax}>
            <Units precision={8} roundingType='dp' value={maxGeoBuy}/>
          </Button> {sendSymbol} <a key={Math.random()} href='https://medium.com/@goFaast/9b14e100d828' target='_blank noopener noreferrer'>due to your location.</a></span>)] : []),
          ...(maximumDeposit ? [validator.lte(maximumDeposit, `Send amount cannot be greater than ${maximumDeposit} ${sendSymbol} to ensure efficient pricing.`)] : []),
          ...(sendWallet ? [validator.lte(maxSendAmount, 'Cannot send more than you have.')] : []),
        )
      )
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
      const { rateLoaded, pair, retrievePairData, sendAmount, estimatedRate, calculateDepositAmount, 
        receiveAmount, calculateReceiveAmount, lastUpdatedField } = this.props
      if (pair && !rateLoaded) {
        retrievePairData(pair)
      }
      if ((prevProps.sendAmount !== sendAmount || prevProps.estimatedRate !== estimatedRate) && lastUpdatedField !== 'receive') {
        calculateReceiveAmount()
      }
      if ((prevProps.receiveAmount !== receiveAmount || prevProps.estimatedRate !== estimatedRate) && lastUpdatedField !== 'send') {
        calculateDepositAmount()
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
      const { maxGeoBuy, handleSelectGeoMax, calculateReceiveAmount } = this.props
      if (maxGeoBuy && maxGeoBuy < 1) {
        handleSelectGeoMax()
      }
      calculateReceiveAmount()
    }
  }),
)(SwapStepOne)

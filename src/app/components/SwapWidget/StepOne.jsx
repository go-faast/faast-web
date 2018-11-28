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
  FormText,
} from 'reactstrap'

import log from 'Log'
import { toBigNumber } from 'Utilities/convert'
import * as validator from 'Utilities/validator'

import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'

import { getRateMinimumDeposit, getRatePrice, isRateLoaded } from 'Selectors/rate'
import { getAllAssetsArray, getAsset } from 'Selectors/asset'
import { getWallet } from 'Selectors/wallet'

import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import Units from 'Components/Units'

import SwapIcon from 'Img/swap-icon.svg?inline'

import style from './style.scss'

const DEFAULT_DEPOSIT = 'BTC'
const DEFAULT_RECEIVE = 'ETH'
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
  change, untouch, submitting,
  depositSymbol, receiveSymbol, supportedAssets, assetSelect, setAssetSelect, 
  validateReceiveAddress, validateRefundAddress, validateDepositAmount,
  handleSubmit, handleSelectedAsset, handleSwitchAssets, isAssetDisabled,
  onChangeDepositAmount, handleSelectMax, maxSendAmount, maxSendAmountLoaded,
  sendWallet,
}) => (
  <Fragment>
    <ProgressBar steps={['Create Swap', `Send ${depositSymbol}`, `Receive ${receiveSymbol}`]} currentStep={0}/>
    <Form onSubmit={handleSubmit}>
      <Card className={classNames('justify-content-center p-0', style.container, style.stepOne)}>
        <CardHeader className='text-center'>
          <h4 className='my-1'>Swap Instantly</h4>
        </CardHeader>
        <CardBody className='pt-3'>
          <Row className='gutter-0'>
            <Col xs={{ size: 12, order: 1 }} lg>
              <StepOneField
                name='depositAmount'
                type='number'
                placeholder={`Send amount${sendWallet ? '' : ' (optional)'}`}
                validate={validateDepositAmount}
                label='You send'
                onChange={onChangeDepositAmount}
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType="append">
                    <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('deposit')}>
                      <CoinIcon key={depositSymbol} symbol={depositSymbol} size={1.25} className='mr-2'/>
                      {depositSymbol} <i className='fa fa-caret-down'/>
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
                    )} {depositSymbol}
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
                disabled
                placeholder='Estimated receive amount'
                label='You receive'
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
                placeholder={`${depositSymbol} return address (optional)`}
                label='From wallet'
                labelClass='mt-3 mt-sm-0 mt-lg-3'
                validate={validateRefundAddress}
                symbol={depositSymbol}
                change={change}
                untouch={untouch}
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
                untouch={untouch}
              />
            </Col>
          </Row>
          <div className='mt-2 mb-4'>
            <Checkbox
              label={
                <small className='pl-1 text-white'>I accept the 
                  <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faast Terms & Conditions</a>
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
        Choose Asset to {assetSelect === 'deposit' ? 'Send' : 'Receive'}
      </ModalHeader>
      <ModalBody>
        {assetSelect && (
          <AssetSelector 
            selectAsset={handleSelectedAsset} 
            supportedAssetSymbols={supportedAssets}
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
    depositSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
    depositAmount: PropTypes.number,
    receiveAddress: PropTypes.string,
    refundAddress: PropTypes.string,
  }),
  defaultProps({
    depositSymbol: DEFAULT_DEPOSIT,
    receiveSymbol: DEFAULT_RECEIVE,
    depositAmount: null,
    receiveAddress: null,
    refundAddress: undefined,
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    depositAsset: (state, { depositSymbol }) => getAsset(state, depositSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    depositAmount: (state) => getFormValue(state, 'depositAmount'),
    sendWallet: (state) => getWallet(state, getFormValue(state, 'sendWalletId')),
  }), {
    createSwap: createSwapAction,
    push: pushAction,
    updateQueryString: updateQueryStringReplace,
    retrievePairData: retrievePairData,
    openViewOnly: openViewOnlyWallet,
  }),
  withProps(({ assets, receiveAddress, depositAmount, refundAddress, depositSymbol, receiveSymbol, sendWallet }) => ({
    supportedAssets: assets.map(({ symbol }) => symbol),
    pair: `${depositSymbol}_${receiveSymbol}`,
    initialValues: {
      receiveAddress,
      depositAmount,
      refundAddress
    },
    maxSendAmount: sendWallet && (sendWallet.balances[depositSymbol] || '0'),
    maxSendAmountLoaded: sendWallet && sendWallet.balancesLoaded,
  })),
  connect(createStructuredSelector({
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    minimumDeposit: (state, { pair }) => getRateMinimumDeposit(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
  })),
  withState('assetSelect', 'setAssetSelect', null), // deposit, receive, or null
  withHandlers({
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'deposit' && deposit) || 
      (assetSelect === 'receive' && receive)),
    handleSelectedAsset: ({ assetSelect, updateQueryString, setAssetSelect, depositSymbol, receiveSymbol }) => (asset) => {
      const { symbol } = asset
      let from = depositSymbol
      let to = receiveSymbol
      if (assetSelect === 'deposit') {
        if (symbol === receiveSymbol) {
          to = from
        }
        from = symbol
      } else { // receive
        if (symbol === depositSymbol) {
          from = to
        }
        to = symbol
      }
      setAssetSelect(null)
      updateQueryString({ from, to })
    },
    handleSwitchAssets: ({ updateQueryString, depositSymbol, receiveSymbol }) => () => {
      updateQueryString({ from: receiveSymbol, to: depositSymbol })
    },
    validateReceiveAddress: ({ receiveAsset }) => validator.all(
      validator.required(),
      validator.walletAddress(receiveAsset)
    ),
    validateRefundAddress: ({ depositAsset }) => validator.walletAddress(depositAsset),
    validateDepositAmount: ({ minimumDeposit, depositSymbol, sendWallet, maxSendAmount }) => validator.all(
      ...(sendWallet ? [validator.required()] : []),
      validator.number(),
      validator.gt(minimumDeposit, `Send amount must be at least ${minimumDeposit} ${depositSymbol}.`),
      ...(sendWallet ? [validator.lte(maxSendAmount, 'Cannot send more than you have.')] : []),
    ),
    onSubmit: ({
      depositSymbol, receiveAsset, 
      createSwap, openViewOnly, push
    }) => (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { depositAmount, receiveAddress, refundAddress, sendWalletId, receiveWalletId } = values
      return createSwap({
        sendSymbol: depositSymbol,
        sendAmount: depositAmount ? toBigNumber(depositAmount) : undefined,
        sendWalletId,
        receiveSymbol,
        receiveWalletId,
        receiveAddress,
        refundAddress,
      })
        .then((swap) => {
          push(`/swap?id=${swap.orderId}`)
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
    const setDepositAmount = (x) => {
      change('depositAmount', log.debugInline('setDepositAmount', x))
      touch('depositAmount')
    }
    return {
      setDepositAmount,
      setEstimatedReceiveAmount,
      handleSelectMax: ({ maxSendAmount }) => () => {
        setDepositAmount(maxSendAmount)
      },
      calculateReceiveAmount: ({ depositAmount, receiveAsset, estimatedRate }) => () => {
        if (estimatedRate && depositAmount) {
          depositAmount = toBigNumber(depositAmount)
          const estimatedReceiveAmount = depositAmount.div(estimatedRate).round(receiveAsset.decimals)
          setEstimatedReceiveAmount(estimatedReceiveAmount.toNumber())
        } else {
          setEstimatedReceiveAmount('')
        }
      }
    }
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      const { rateLoaded, pair, retrievePairData, depositAmount, estimatedRate, calculateReceiveAmount } = this.props
      if (pair && !rateLoaded) {
        retrievePairData(pair)
      }
      if (prevProps.depositAmount !== depositAmount || prevProps.estimatedRate !== estimatedRate) {
        calculateReceiveAmount()
      }
    },
    componentWillMount() {
      const { updateQueryString, depositSymbol, receiveSymbol, retrievePairData, pair } = this.props
      if (depositSymbol === receiveSymbol) {
        let to = DEFAULT_RECEIVE
        let from = DEFAULT_DEPOSIT
        if (to === depositSymbol || from === receiveSymbol) {
          from = to
          to = DEFAULT_DEPOSIT
        }
        updateQueryString({ to, from })
      } else {
        retrievePairData(pair)
      }
    }
  }),
)(SwapStepOne)

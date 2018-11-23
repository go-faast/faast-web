import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, formValueSelector } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { getAllAssetsArray, getAsset } from 'Selectors/asset'
import {
  isAccountSearchResultWalletInPortfolio, getWallet,
} from 'Selectors'
import ReduxFormField from 'Components/ReduxFormField'
import Checkbox from 'Components/Checkbox'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import ProgressBar from 'Components/ProgressBar'
import WalletSelectField from 'Components/WalletSelectField'
import {
  Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody, InputGroupAddon, Row, Col,
  FormText,
} from 'reactstrap'
import { container, submitButton, reverse } from './style.scss'
import { toBigNumber } from 'Utilities/convert'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { createSwap as createSwapAction } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { retrievePairData } from 'Actions/rate'
import { openViewOnlyWallet } from 'Actions/access'
import PropTypes from 'prop-types'
import { getRateMinimumDeposit, getRatePrice, isRateLoaded } from 'Selectors/rate'
import * as validator from 'Utilities/validator'
import Units from 'Components/Units'
import log from 'Log'

const DEFAULT_DEPOSIT = 'BTC'
const DEFAULT_RECEIVE = 'ETH'
const FORM_NAME = 'swapWidget'

const formValue = formValueSelector(FORM_NAME)

const SwapStepOne = ({
  change, submitting,
  depositSymbol, receiveSymbol, supportedAssets, assetSelect, setAssetSelect, 
  validateReceiveAddress, validateRefundAddress, validateDepositAmount,
  handleSubmit, handleSelectedAsset, handleSwitchAssets, isAssetDisabled,
  onChangeDepositAmount, handleSelectMax, maxSendAmount, maxSendAmountLoaded,
  sendWallet,
}) => (
  <Fragment>
    <ProgressBar steps={['Create Swap', `Deposit ${depositSymbol}`, `Receive ${receiveSymbol}`]} currentStep={0}/>
    <Form onSubmit={handleSubmit}>
      <Card className={classNames('container justify-content-center p-0', container)}>
        <CardHeader className='text-center'>
          <h4 className='my-1'>Swap Instantly</h4>
        </CardHeader>
        <CardBody className='pt-3'>
          <Row className='gutter-0 align-items-center justify-content-center'>
            <Col className='text-center'>
              <p>Sell</p>
            </Col>
            <Col xs='1'/>
            <Col className='text-center'>
              <p>Buy</p>
            </Col>
          </Row>
          <Row className='gutter-0'>
            <Col>
              <ReduxFormField
                id='depositAmount'
                name='depositAmount'
                type='number'
                placeholder={`Sell amount${sendWallet ? '' : ' (optional)'}`}
                validate={validateDepositAmount}
                inputClass='flat'
                className='mb-2'
                onChange={onChangeDepositAmount}
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType="append">
                    <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('deposit')}>
                      <CoinIcon key={depositSymbol} symbol={depositSymbol} size={1.25} className='mr-2'/>
                      {depositSymbol} <i className='fa fa-caret-down'/>
                    </Button>
                  </InputGroupAddon>
                )}
              />
              {sendWallet ? (
                <p className='text-muted mb-0'><small>
                  You have {maxSendAmountLoaded ? (
                    <Button color='link-plain' onClick={handleSelectMax} className='align-baseline'>
                      <small><Units precision={8} value={maxSendAmount}/></small>
                    </Button>
                  ) : (
                    <i className='fa fa-spinner fa-pulse'/>
                  )} {depositSymbol}
                </small></p>
              ) : (
                <p className='text-muted'><small>If omitted, a variable market rate is used.</small></p>
              )}
            </Col>
            <Col xs='1' className='text-center'>
              <Button color='ultra-dark' onClick={handleSwitchAssets}
                className={classNames('flat', reverse)}>
                <SwapIcon/>
              </Button>
            </Col>
            <Col>
              <ReduxFormField
                id='receiveAmount'
                name='receiveAmount'
                type='number'
                disabled
                placeholder='Estimated buy amount'
                inputClass='flat'
                className='mb-2'
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType="append">
                    <Button color={invalid ? 'danger' : 'dark'} size='sm' onClick={() => setAssetSelect('receive')}>
                      <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                      {receiveSymbol} <i className='fa fa-caret-down'/>
                    </Button>
                  </InputGroupAddon>
                )}
              />
              <FormText color="muted">Only an estimate. Not a guaranteed quote.</FormText>
            </Col>
          </Row>
          <Row className='gutter-0'>
            <Col>
              <WalletSelectField 
                addressFieldName='refundAddress'
                walletIdFieldName='sendWalletId'
                placeholder={`${depositSymbol} Return Address (optional)`}
                autoCorrect='false'
                autoCapitalize='false'
                spellCheck='false'
                validate={validateRefundAddress}
                inputClass='flat'
                symbol={depositSymbol}
                change={change}
                className='mb-2 mt-3'
              />
            </Col>
            <Col xs='1'/>
            <Col>
              <WalletSelectField 
                addressFieldName='receiveAddress'
                walletIdFieldName='receiveWalletId'
                placeholder={`${receiveSymbol} Receive Address`}
                autoCorrect='false'
                autoCapitalize='false'
                spellCheck='false'
                validate={validateReceiveAddress}
                inputClass='flat'
                symbol={receiveSymbol}
                change={change}
                className='mb-2 mt-3'
              />
            </Col>
          </Row>
          <div className='my-4'>
            <Checkbox
              label={
                <small className='pl-1 text-white'>I accept the 
                  <a href='https://faa.st/terms' target='_blank' rel='noopener noreferrer'> Faast Terms & Conditions</a>
                </small>
              }
              labelClass='p-0'
            />
          </div>
          <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit' disabled={submitting}>
            {!submitting ? 'Create Swap' : 'Generating Swap...' }
          </Button>
        </CardBody>
      </Card>
    </Form>
    <Modal size='lg' isOpen={Boolean(assetSelect)} toggle={() => setAssetSelect(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
      <ModalHeader toggle={() => setAssetSelect(null)} tag='h4' className='text-primary'>
        Choose Asset to {assetSelect === 'deposit' ? 'Sell' : 'Buy'}
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
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio,
    depositAsset: (state, { depositSymbol }) => getAsset(state, depositSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
    depositAmount: (state) => formValue(state, 'depositAmount'),
    sendWallet: (state) => getWallet(state, formValue(state, 'sendWalletId')),
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
    validateReceiveAddress: ({ receiveAsset }) => validator.all(validator.required('A valid wallet address is required.'), validator.walletAddress(receiveAsset)),
    validateRefundAddress: ({ depositAsset }) => validator.walletAddress(depositAsset),
    validateDepositAmount: ({ minimumDeposit, depositSymbol, sendWallet, maxSendAmount }) => validator.all(
      ...(sendWallet ? [validator.required()] : []),
      validator.number(),
      validator.gt(minimumDeposit, `Sell amount must be at least ${minimumDeposit} ${depositSymbol}.`),
      ...(sendWallet ? [validator.lte(maxSendAmount, 'Cannot sell more than you have')] : []),
    ),
    onSubmit: ({
      depositSymbol, receiveAsset, 
      createSwap, openViewOnly, isAlreadyInPortfolio, push
    }) => (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { depositAmount, receiveAddress, refundAddress } = values
      return createSwap({
        sendAmount: depositAmount ? toBigNumber(depositAmount) : undefined,
        receiveAddress,
        refundAddress,
        sendSymbol: depositSymbol,
        receiveSymbol,
      })
        .then((swap) => {
          push(`/swap?id=${swap.orderId}`)
          if (!isAlreadyInPortfolio && (receiveSymbol === 'ETH' || ERC20)) { 
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
      calculateReceiveAmount: ({ depositAmount, estimatedRate }) => () => {
        if (estimatedRate && depositAmount) {
          depositAmount = toBigNumber(depositAmount)
          const estimatedReceiveAmount = depositAmount.div(estimatedRate)
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

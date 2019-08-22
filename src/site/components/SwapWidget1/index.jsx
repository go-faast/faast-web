import React, { Fragment } from 'react'
import { compose, setDisplayName, withHandlers, withProps, 
  withState, setPropTypes, defaultProps, lifecycle } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Button, Row, Col, InputGroupAddon, Form } from 'reactstrap'
import { reduxForm, formValueSelector } from 'redux-form'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import { retrievePairData } from 'Actions/rate'
import { areAssetsLoaded, getAllAssetSymbols } from 'Common/selectors/asset'
import { getRatePrice, isRateLoaded } from 'Common/selectors/rate'
import { toBigNumber } from 'Utilities/convert'
import SwapIcon from 'Img/swap-icon.svg?inline'
import GAEventButton from 'Components/GAEventButton'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelectorList'
import ReduxFormField from 'Components/ReduxFormField'

import { submitButton, swap, input, inputButton, assetListContainer, 
  container, buttonContainer, inputCol } from './style.scss'

const FORM_NAME = 'landing_swap_widget'
const getFormValue = formValueSelector(FORM_NAME)

const StepOneField = withProps(({ labelClass, inputClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass),
  inputClass: classNames('flat', inputClass),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', className: 'text-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapWidget = ({ onSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, 
  supportedAssets, assetSelect, estimatedField, handleChangeReceiveAmount, setAssetSelect, 
  depositSymbol, receiveSymbol, handleSubmit, onCloseAssetSelector, receiveAmount, depositAmount,
  areAssetsLoaded, handleChangeDepositAmount, translations: { static: { swapWidget = {} } = {} } }) => {
  return (
    <Fragment>
      <Form className='px-lg-0 px-2' onSubmit={handleSubmit}>
        <Row className={classNames(container, 'mx-auto align-items-center mt-5 p-md-2 px-4')}>
          <Col className='d-lg-none d-block mt-4'>
            <h2 style={{ color: '#3C4050' }} >{swapWidget.swapInstantly}</h2>
          </Col>
          <Col className={classNames(inputCol, 'pr-0 pl-3 py-lg-0 py-3')} xs={{ size: 12, order: 1 }} lg={{ size: true, order: 1 }}>
            <div className='position-relative d-flex'>
              {assetSelect === 'deposit' && (
                <div className={classNames(assetListContainer, 'd-flex')}>
                  <AssetSelector 
                    selectAsset={handleSelectedAsset} 
                    supportedAssetSymbols={supportedAssets}
                    isAssetDisabled={isAssetDisabled}
                    onClose={onCloseAssetSelector}
                    dark={false}
                  />
                </div>
              )}
              <StepOneField
                name='depositAmount'
                type='number'
                step='any'
                placeholder='Send Amount'
                inputGroupClass='flat'
                className={inputCol}
                label={<div style={{ minWidth: 80 }}><span style={{ fontWeight: 600, color: '#3C4050' }}>{`Send ${depositSymbol}`}</span></div>}
                onChange={handleChangeDepositAmount}
                inputClass={classNames({ 'font-italic': estimatedField === 'deposit' }, input)}
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType='append'>
                    <Button className={inputButton} color={invalid ? 'danger' : 'light'} size='sm' onClick={() => setAssetSelect('deposit')}>
                      {areAssetsLoaded ? (
                        <Fragment>
                          <CoinIcon key={depositSymbol} symbol={depositSymbol} size={1.25} className='mr-2'/>
                          <span>{depositSymbol}</span><i className='ml-1 fa fa-caret-down'/>
                        </Fragment>
                      ) : (
                        <i className='fa fa-spinner fa-pulse'/>
                      )}
                    </Button>
                  </InputGroupAddon>
                )}
              />
            </div>
          </Col>
          <Col xs={{ size: 12, order: 3 }} lg={{ size: 1, order: 2 }}>
            <Button className={classNames('flat p-0', swap)} onClick={handleSwitchAssets}>
              <SwapIcon className='position-relative' style={{ fill: '#575D75', width: 20, top: 10 }}/>
            </Button>
          </Col>
          <Col className={classNames(inputCol, 'pr-lg-3 pr-0 pl-lg-0 pl-3 pt-lg-0 pt-3')} xs={{ size: 12, order: 4 }} lg={{ size: true, order: 3 }}>
            <div className='position-relative d-flex'>
              {assetSelect === 'receive' && (
                <div className={classNames(assetListContainer, 'd-flex')}>
                  <AssetSelector 
                    selectAsset={handleSelectedAsset} 
                    supportedAssetSymbols={supportedAssets}
                    isAssetDisabled={isAssetDisabled}
                    onClose={onCloseAssetSelector}
                    dark={false}
                  />
                </div>
              )}
            </div>
            <StepOneField
              name='receiveAmount'
              type='number'
              step='any'
              placeholder='Receive amount'
              inputGroupClass='flat'
              className={inputCol}
              label={<div style={{ minWidth: 80 }}><span style={{ fontWeight: 600, color: '#3C4050' }}>{`Receive ${receiveSymbol}`}</span></div>}
              onChange={handleChangeReceiveAmount}
              inputClass={classNames({ 'font-italic': estimatedField === 'receive' }, input)}
              addonAppend={({ invalid }) => (
                <InputGroupAddon addonType='append'>
                  <Button className={inputButton} color={invalid ? 'danger' : 'light'} size='sm' onClick={() => setAssetSelect('receive')}>
                    {areAssetsLoaded ? (
                      <Fragment>
                        <CoinIcon key={receiveSymbol} symbol={receiveSymbol} size={1.25} className='mr-2'/>
                        <span>{receiveSymbol}</span> <i className='ml-1 fa fa-caret-down'/>
                      </Fragment>
                    ) : (
                      <i className='fa fa-spinner fa-pulse'/>
                    )}
                  </Button>
                </InputGroupAddon>
              )}
            />
          </Col>
          <Col className={classNames(buttonContainer, 'px-0 mx-0')} xs={{ size: 12, order: 4 }} lg='2'>
            <GAEventButton 
              tag={Button}
              event={{ category: 'Static', action: 'Go to Swap' }}
              color='primary'
              href={`/app/swap?from=${depositSymbol}&to=${receiveSymbol}&toAmount=${receiveAmount}&fromAmount=${depositAmount}`}
              className={classNames('mt-1 mb-2 mx-auto flat position-relative', submitButton)} 
              style={{ color: '#fff' }}
              onClick={onSubmit}
            >
              {swapWidget.swap}
            </GAEventButton>
          </Col>
        </Row>
      </Form>
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  reduxForm({
    form: FORM_NAME,
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  setPropTypes({
    defaultReceive: PropTypes.string,
    defaultDeposit: PropTypes.string,
  }),
  defaultProps({
    defaultReceive: 'ETH',
    defaultDeposit: 'BTC'
  }),
  withState('assetSelect', 'setAssetSelect', null), // deposit, receive, or null
  withState('depositSymbol', 'setDepositSymbol', ({ defaultDeposit }) => defaultDeposit),
  withState('receiveSymbol', 'setReceiveSymbol', ({ defaultReceive }) => defaultReceive),
  withProps(({ assets, depositSymbol, receiveSymbol }) => ({
    supportedAssets: assets.map(({ symbol }) => symbol),
    pair: `${depositSymbol}_${receiveSymbol}`
  })),
  connect(createStructuredSelector({
    areAssetsLoaded,
    assetSymbols: getAllAssetSymbols,
    rateLoaded: (state, { pair }) => isRateLoaded(state, pair),
    estimatedRate: (state, { pair }) => getRatePrice(state, pair),
    depositAmount: (state) => getFormValue(state, 'depositAmount'),
    receiveAmount: (state) => getFormValue(state, 'receiveAmount'),
  }), {
    retrievePairData,
  }),
  withHandlers({
    updateDepositAmount: ({ change }) => (amount) => {
      change('depositAmount', amount)
    },
    updateReceiveAmount: ({ change }) => (amount) => {
      change('receiveAmount', amount)
    },
  }),
  withHandlers({
    isAssetDisabled: ({ assetSelect }) => ({ deposit, receive }) =>
      !((assetSelect === 'deposit' && deposit) || 
      (assetSelect === 'receive' && receive)),
    handleSelectedAsset: ({ assetSelect, setAssetSelect, depositSymbol, receiveSymbol, 
      setDepositSymbol, setReceiveSymbol }) => (asset) => {
      const { symbol } = asset
      let from = depositSymbol
      let to = receiveSymbol
      if (assetSelect === 'deposit') {
        if (symbol === receiveSymbol) {
          setReceiveSymbol(from)
        }
        setDepositSymbol(symbol)
      } else { // receive
        if (symbol === depositSymbol) {
          setDepositSymbol(to)
        }
        setReceiveSymbol(symbol)
      }
      setAssetSelect(null)
    },
    handleSwitchAssets: ({ setReceiveSymbol, setDepositSymbol, depositSymbol, receiveSymbol }) => () => {
      setReceiveSymbol(depositSymbol)
      setDepositSymbol(receiveSymbol)
    },
    onSubmit: () => (values) => {
      console.log(values)
    },
    onCloseAssetSelector: ({ setAssetSelect }) => () => {
      setAssetSelect(null)
    },
    handleChangeDepositAmount: ({ estimatedRate, depositAmount, updateDepositAmount, updateReceiveAmount }) => (_, sendAmount) => {
      if (estimatedRate && sendAmount) {
        sendAmount = toBigNumber(sendAmount).round(8)
        const estimatedReceiveAmount = sendAmount.div(estimatedRate).round(8)
        updateReceiveAmount(estimatedReceiveAmount.toString())
        if (!depositAmount) { 
          updateDepositAmount(sendAmount)
        }
      } else {
        updateReceiveAmount(null)
      }
    },
    handleChangeReceiveAmount: ({ estimatedRate, updateDepositAmount }) => (_, receiveAmount) => {
      if (estimatedRate && receiveAmount) {
        receiveAmount = toBigNumber(receiveAmount).round(8)
        const estimatedDepositAmount = receiveAmount.times(estimatedRate).round(8)
        updateDepositAmount(estimatedDepositAmount)
      } else {
        updateDepositAmount(null)
      }
    },
  }),
  lifecycle({
    componentDidUpdate(prevProps) {
      const {
        rateLoaded, pair, retrievePairData, estimatedRate, 
        handleChangeDepositAmount, depositAmount
      } = this.props
      if (pair && !rateLoaded) {
        retrievePairData(pair)
      }
      if (estimatedRate && prevProps.estimatedRate !== estimatedRate) {
        handleChangeDepositAmount(null, depositAmount)
      }
    },
    async componentWillMount() {
      const { retrievePairData, pair, handleChangeDepositAmount } = this.props
      await retrievePairData(pair)
      handleChangeDepositAmount(null, 1)
    },
  }),
)(SwapWidget)

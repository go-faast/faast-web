import React, { Fragment } from 'react'
import { compose, setDisplayName, withHandlers, withProps, withState, setPropTypes, defaultProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Button, Row, Col, InputGroupAddon, Form } from 'reactstrap'
import { reduxForm } from 'redux-form'
import classNames from 'class-names'
import PropTypes from 'prop-types'


import { areAssetsLoaded, getAllAssetSymbols } from 'Common/selectors/asset'
import SwapIcon from 'Img/swap-icon.svg?inline'
import GAEventButton from 'Components/GAEventButton'
import CoinIcon from 'Components/CoinIcon'
import ReduxFormField from 'Components/ReduxFormField'

import { submitButton, swap, input, inputButton, assetListContainer } from './style.scss'

import HomeStyle from 'Site/pages/Home1/style.scss'

const StepOneField = withProps(({ labelClass, inputClass, className, labelCol, inputCol }) => ({
  labelClass: classNames('mb-sm-0 mb-lg-2 py-sm-2 p-lg-0', labelClass),
  inputClass: classNames('flat', inputClass),
  className: classNames('mb-2 gutter-x-3', className),
  row: true,
  labelCol: { xs: '12', sm: '3', md: '2', lg: '12', className: 'text-left text-sm-right text-lg-left', ...labelCol },
  inputCol: { xs: '12', sm: true, md: true, lg: '12', ...inputCol },
}))(ReduxFormField)

const SwapWidget = ({ onSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, 
  supportedAssets, assetSelect, estimatedField, onChangeReceiveAmount, setAssetSelect, 
  depositSymbol, receiveSymbol, receiveAmount, depositAmount, handleSubmit, onCloseAssetSelector,
  areAssetsLoaded, translations: { static: { swapWidget = {} } = {} } }) => {
  return (
    <Fragment>
      <Row className='mx-auto align-items-center mt-5 px-2' style={{ background: '#FAFAFA', width: 995, height: 136, borderRadius: 4, boxShadow: '0px 2px 5px 4px rgba(0,0,0,.49)', flexWrap: 'nowrap' }}>
        <Col style={{ maxWidth: 384 }} sm='12' md='5' className='pr-0'>
          <Form onSubmit={handleSubmit}>
            <div className='position-relative'>
              {assetSelect === 'deposit' && (
                <div className={assetListContainer}>
                  <AssetSelector 
                    selectAsset={handleSelectedAsset} 
                    // supportedAssetSymbols={assetSymbols}
                    isAssetDisabled={isAssetDisabled}
                    onClose={onCloseAssetSelector}
                  />
                </div>
              )}
              <StepOneField
                name='depositAmount'
                type='number'
                step='any'
                placeholder='Deposit Amount'
                inputGroupClass='flat'
                label={<span style={{ fontWeight: 600, color: '#3C4050' }}>{`Deposit ${depositSymbol}`}</span>}
                onChange={onChangeReceiveAmount}
                inputClass={classNames({ 'font-italic': estimatedField === 'deposit' }, input)}
                addonAppend={({ invalid }) => (
                  <InputGroupAddon addonType="append">
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
          </Form>
        </Col>
        <Col sm='12' md='1'>
          <Button className={classNames('flat p-0', swap)} onClick={handleSwitchAssets}>
            <SwapIcon className='position-relative' style={{ fill: '#575D75', width: 20, top: 10 }}/>
          </Button>
        </Col>
        <Col style={{ maxWidth: 384 }} sm='12' md='5' className='pl-0'>
          <StepOneField
            name='receiveAmount'
            type='number'
            step='any'
            placeholder='Receive amount'
            inputGroupClass='flat'
            label={<span style={{ fontWeight: 600, color: '#3C4050' }}>{`Receive ${receiveSymbol}`}</span>}
            onChange={onChangeReceiveAmount}
            inputClass={classNames({ 'font-italic': estimatedField === 'receive' }, input)}
            addonAppend={({ invalid }) => (
              <InputGroupAddon addonType="append">
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
        <Col style={{ maxWidth: 115 }} className='p-0 m-0' md='2'>
          <GAEventButton 
            tag={Button}
            event={{ category: 'Static', action: 'Go to Swap' }}
            color='primary'
            href={`/app/swap?from=${depositSymbol}&to=${receiveSymbol}`}
            className={classNames('mt-1 mb-2 mx-auto flat position-relative', submitButton)} 
            style={{ color: '#fff', width: 115 }}
            onClick={onSubmit}
          >
            Swap
          </GAEventButton>
        </Col>
      </Row>
    </Fragment>
  )
}

export default compose(
  setDisplayName('SwapWidget'),
  reduxForm({
    form: 'landing_swap_widget',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
  connect(createStructuredSelector({
    areAssetsLoaded,
    assetSymbols: getAllAssetSymbols,
  }), {
  }),
  setPropTypes({
    defaultReceive: PropTypes.string,
    defaultDeposit: PropTypes.string,
  }),
  defaultProps({
    defaultReceive: 'ETH',
    defaultDeposit: 'BTC'
  }),
  withProps(({ assets }) => ({
    supportedAssets: assets.map(({ symbol }) => symbol),
  })),
  withState('assetSelect', 'setAssetSelect', null), // deposit, receive, or null
  withState('depositSymbol', 'setDepositSymbol', ({ defaultDeposit }) => defaultDeposit),
  withState('receiveSymbol', 'setReceiveSymbol', ({ defaultReceive }) => defaultReceive),
  withState('receiveAmount', 'setReceiveAmount', 5),
  withState('depositAmount', 'setDepositAmount', 10),
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
  })
)(SwapWidget)

import React from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withStateHandlers, withHandlers } from 'recompose'
import classNames from 'class-names'
import { reduxForm } from 'redux-form'
import { createStructuredSelector } from 'reselect'
import { getAllAssetsArray, getAsset } from 'Selectors/asset'
import ReduxFormField from 'Components/ReduxFormField'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import { Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody } from 'reactstrap'
import web3 from 'Services/Web3'
import { container, section, submitButton, asset, icon, receive, swap } from './style.scss'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { Address } from 'bitcore-lib'

const SwapStepOne = ({ isPopUpOpen, handlePopUp, supportedAssets, 
  deposit, receive, handleSelectedAsset, handleDepositSymbol, handleReceiveSymbol }) => (
    <Card className={classNames('container justify-content-center p-0', container)}>
      <CardHeader className='text-center pb-4'>
        <h4 className='mb-3 mt-1'>Swap Instantly</h4>
        <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => handlePopUp('deposit')}>
          <div className={asset}>
            <CoinIcon key={deposit.symbol} symbol={deposit.symbol} style={{ width: 48, height: 48 }} className='m-1'/>
            <h4 className='m-0'>{deposit.symbol}</h4>
            <p>Deposit</p>
          </div>
        </Button>
        <Button color='ultra-dark' className={classNames('flat', swap)} onClick={() => { handleDepositSymbol(receive.symbol); handleReceiveSymbol(deposit.symbol) }}><SwapIcon/></Button>
        <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => handlePopUp('receive')}>
          <div className={asset}>
            <CoinIcon key={receive.symbol} symbol={receive.symbol} style={{ width: 48, height: 48 }} className='m-1'/>
            <h4 className='m-0'>{receive.symbol}</h4>
            <p>Receive</p>
          </div>
        </Button>
      </CardHeader>
      <CardBody className='pt-1'>
        <SwapForm/>
      </CardBody>
      <Modal size='lg' isOpen={isPopUpOpen} toggle={() => handlePopUp(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
        <ModalHeader toggle={() => handlePopUp(null)} tag='h4' className='text-primary'>
          Add Asset
        </ModalHeader>
        <ModalBody>
          {isPopUpOpen && (
            <AssetSelector selectAsset={handleSelectedAsset} supportedAssetSymbols={supportedAssets}/>
          )}
        </ModalBody>
      </Modal>
    </Card>
)

const validateAddress = (address) => {
  if (!web3.utils.isAddress(address) && !Address.isValid(address)) {
    return <p>Please enter a receiving address</p>
  }
}

const SwapForm = reduxForm({
  form: 'swapWidget'
})(({ handleSubmit, invalid }) => (
  <Form onSubmit={handleSubmit}>
    <div className={section}>
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='receive'
        name='receive'
        type='text'
        placeholder='Receive Address'
        autoFocus
        labelProps={{ xs: '12', md: '4' }}
        inputCol={{ xs:'12', md: true }}
        validate={validateAddress}
        inputClassName={classNames('flat',receive)}
      />
      <div style={{ position: 'relative' }}>
        <ReduxFormField
          row
          className='gutter-3 align-items-center'
          id='deposit'
          name='deposit'
          type='text'
          placeholder='Deposit Amount (optional)'
          autoFocus
          labelProps={{ xs: '12', md: '4' }}
          inputCol={{ xs:'12', md: true }}
          inputClassName='flat'
        />
        <Expandable 
          style={{ position: 'absolute', top: 16, right: 25 }} 
          shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
          expanded={'If deposit amount is omitted, the amount you receive will be calculated based on amount you deposit'}>
        </Expandable>
      </div>
      <div style={{ position: 'relative' }}>
        <ReduxFormField
          row
          className='gutter-3 align-items-center'
          id='return'
          name='return'
          type='text'
          placeholder='Return Address (optional)'
          autoFocus
          labelProps={{ xs: '12', md: '4' }}
          inputCol={{ xs:'12', md: true }}
          inputClassName='flat'
        />
         <Expandable 
          style={{ position: 'absolute', top: 16, right: 25 }} 
          shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
          expanded={'This address will be used in the case that your funds need to be returned'}>
        </Expandable>
      </div>
    </div>
    <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit' disabled={invalid}>
      Swap
    </Button>
  </Form>
))

export default compose(
  setDisplayName('SwapStepOne'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray
  })),
  withProps(({ assets }) => {
    let supportedAssets = []
    assets.forEach((asset) => {
      supportedAssets.push(asset.symbol)
    })
    return {
      supportedAssets
    }
  }),
  withStateHandlers(
    { isPopUpOpen: false, assetType: null, deposit: {}, receive: {} },
    { handlePopUp: ({ isPopUpOpen }) => (type) => ({ isPopUpOpen: !isPopUpOpen, assetType: type }) },
  ),
  withState('depositSymbol', 'handleDepositSymbol', 'BTC'),
  withState('receiveSymbol', 'handleReceiveSymbol', 'ETH'),
  withHandlers({
    handleSelectedAsset: ({ assetType, handlePopUp, handleDepositSymbol, handleReceiveSymbol, depositSymbol, receiveSymbol }) => (asset) => {
      const { symbol } = asset
      if (assetType === 'deposit' && (symbol != receiveSymbol)) {
        handleDepositSymbol(symbol)
      } else if (assetType === 'deposit' && (symbol === receiveSymbol)) {
        handleReceiveSymbol(depositSymbol)
        handleDepositSymbol(symbol)
      } else if (assetType === 'receive' && (symbol != depositSymbol)) {
        handleReceiveSymbol(symbol)
      } else {
        handleDepositSymbol(receiveSymbol)
        handleReceiveSymbol(symbol)
      }
      handlePopUp()
    }
  }),
  connect(createStructuredSelector({
    deposit: (state, { depositSymbol }) => getAsset(state, depositSymbol),
    receive: (state, { receiveSymbol }) => getAsset(state, receiveSymbol)
  }))
)(SwapStepOne)

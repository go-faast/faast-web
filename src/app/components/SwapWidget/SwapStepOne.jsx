import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withStateHandlers, withHandlers } from 'recompose'
import classNames from 'class-names'
import { reduxForm } from 'redux-form'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { getAllAssetsArray, getAsset } from 'Selectors/asset'
import {
  isAccountSearchResultWalletInPortfolio,
} from 'Selectors'
import ReduxFormField from 'Components/ReduxFormField'
import Expandable from 'Components/Expandable'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'
import ProgressBar from 'Components/ProgressBar'
import { Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody } from 'reactstrap'
import web3 from 'Services/Web3'
import { container, section, submitButton, asset, icon, receive, swap } from './style.scss'
import { toBigNumber } from 'Utilities/convert'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { Address } from 'bitcore-lib'
import uuid from 'uuid/v4'
import { createManualSwap } from 'Actions/swap'
import { searchAddress, addToPortfolio } from 'Actions/accountSearch'

const SwapStepOne = ({ isPopUpOpen, handlePopUp, supportedAssets, 
  sendSymbol, receiveSymbol, handleSelectedAsset, handleSendSymbol, handleReceiveSymbol, 
  handleReceiveAddressValidation, handleReturnAddressValidation, handleSwapSubmit, isLoadingSwap }) => (
    <Fragment>
      <ProgressBar steps={['Create Swap', `Deposit ${sendSymbol}`, `Receive ${receiveSymbol}`]} currentStep={0}/>
      <Card className={classNames('container justify-content-center p-0', container)}>
        <CardHeader className='text-center pb-4'>
          <h4 className='mb-3 mt-1'>Swap Instantly</h4>
          <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => handlePopUp('deposit')}>
            <div className={asset}>
              <CoinIcon key={sendSymbol} symbol={sendSymbol} style={{ width: 48, height: 48 }} className='m-1'/>
              <h4 className='m-0'>{sendSymbol}</h4>
              <p>Deposit</p>
            </div>
          </Button>
          <Button color='ultra-dark' className={classNames('flat', swap)} onClick={() => { handleSendSymbol(receiveSymbol); handleReceiveSymbol(sendSymbol) }}><SwapIcon/></Button>
          <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => handlePopUp('receive')}>
            <div className={asset}>
              <CoinIcon key={receiveSymbol} symbol={receiveSymbol} style={{ width: 48, height: 48 }} className='m-1'/>
              <h4 className='m-0'>{receiveSymbol}</h4>
              <p>Receive</p>
            </div>
          </Button>
        </CardHeader>
        <CardBody className='pt-1'>
          <SwapForm
            onSubmit={handleSwapSubmit} 
            receiveSymbol={receiveSymbol} 
            sendSymbol={sendSymbol}
            initialValues={{ sendSymbol, receiveSymbol }}
            handleReturnAddressValidation={handleReturnAddressValidation} 
            handleReceiveAddressValidation={handleReceiveAddressValidation}
            isLoadingSwap={isLoadingSwap}
          />
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
    </Fragment>
)

const SwapForm = reduxForm({
  form: 'swapWidget',
  enableReinitialize: true,
  keepDirtyOnReinitialize: true,
  updateUnregisteredFields: true
})(({ handleSubmit, invalid, sendSymbol, receiveSymbol, handleReturnAddressValidation, handleReceiveAddressValidation, isLoadingSwap }) => (
  <Form onSubmit={handleSubmit}>
    <div className={section}>
    <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='sendSymbol'
        name='sendSymbol'
        type='hidden'
        autoFocus
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        labelProps={{ xs: '12', md: '4' }}
        inputClass='flat'
      />
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='receiveSymbol'
        name='receiveSymbol'
        type='hidden'
        autoFocus
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        labelProps={{ xs: '12', md: '4' }}
        inputClass='flat'
      />
      <ReduxFormField
        row
        className='gutter-3 align-items-center'
        id='receiveAddress'
        name='receiveAddress'
        type='text'
        placeholder={`${receiveSymbol} Receive Address`}
        autoFocus
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        labelProps={{ xs: '12', md: '4' }}
        inputCol={{ xs:'12', md: true }}
        validate={handleReceiveAddressValidation}
        inputClass={classNames('flat', receive)}
      />

      <div style={{ position: 'relative' }}>
        <ReduxFormField
          row
          className='gutter-3 align-items-center'
          id='sendAmount'
          name='sendAmount'
          type='number'
          placeholder={`${sendSymbol} Deposit Amount (optional)`}
          autoFocus
          autoCorrect='false'
          autoCapitalize='false'
          spellCheck='false'
          labelProps={{ xs: '12', md: '4' }}
          inputCol={{ xs:'12', md: true }}
          inputClass='flat'
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
          id='refundAddress'
          name='refundAddress'
          type='text'
          placeholder={`${sendSymbol} Return Address (optional)`}
          autoCorrect='false'
          autoCapitalize='false'
          spellCheck='false'
          autoFocus
          labelProps={{ xs: '12', md: '4' }}
          inputCol={{ xs:'12', md: true }}
          validate={handleReturnAddressValidation}
          inputClass='flat'
        />
         <Expandable 
          style={{ position: 'absolute', top: 16, right: 25 }} 
          shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
          expanded={'This address will be used in the case that your funds need to be returned'}>
        </Expandable>
      </div>
    </div>
    <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit' disabled={invalid || isLoadingSwap}>
      {!isLoadingSwap ? 'Create Swap' : 'Generating Swap...' }
    </Button>
  </Form>
))

export default compose(
  setDisplayName('SwapStepOne'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio
  }), {
    createSwap: createManualSwap,
    searchAddress: searchAddress,
    addWalletToPortfolio: addToPortfolio,
    push: pushAction
  }),
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
  withState('sendSymbol', 'handleSendSymbol', 'BTC'),
  withState('receiveSymbol', 'handleReceiveSymbol', 'ETH'),
  withState('isLoadingSwap', 'handleLoading', false),
  connect(createStructuredSelector({
    deposit: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receive: (state, { receiveSymbol }) => getAsset(state, receiveSymbol)
  })),
  withHandlers({
    handleForward: ({ push }) => (orderId) => push(`/swap?id=${orderId}`),
  }),
  withHandlers({
    handleSelectedAsset: ({ assetType, handlePopUp, handleSendSymbol, handleReceiveSymbol, sendSymbol, receiveSymbol }) => (asset) => {
      const { symbol } = asset
      if (assetType === 'deposit' && (symbol != receiveSymbol)) {
        handleSendSymbol(symbol)
      } else if (assetType === 'deposit' && (symbol === receiveSymbol)) {
        handleReceiveSymbol(sendSymbol)
        handleSendSymbol(symbol)
      } else if (assetType === 'receive' && (symbol != sendSymbol)) {
        handleReceiveSymbol(symbol)
      } else {
        handleSendSymbol(receiveSymbol)
        handleReceiveSymbol(symbol)
      }
      handlePopUp()
    },
    handleReceiveAddressValidation: ({ receive }) => (address) => {
      const { symbol, ERC20 } = receive
      //if no address is valid
      if (!web3.utils.isAddress(address) && !Address.isValid(address)) {
        return `Please enter a valid ${symbol} wallet address`
      }
      //if addresses are valid but wrong wallet
      else if ((web3.utils.isAddress(address) && (symbol !== 'ETH' && !ERC20)) || (Address.isValid(address) && symbol !== 'BTC')) {
        return `Please enter a valid ${symbol} wallet address`
      }
    },
    handleReturnAddressValidation: ({ deposit }) => (address) => {
      const { symbol, ERC20 } = deposit
      //if no address is valid
      if (!web3.utils.isAddress(address) && !Address.isValid(address) && address) {
        return `Please enter a valid ${symbol} wallet address`
      }
      //if addresses are valid but wrong wallet
      else if ((web3.utils.isAddress(address) && (symbol !== 'ETH' && !ERC20)) || (Address.isValid(address) && symbol !== 'BTC') && address) {
        return `Please enter a valid ${symbol} wallet address`
      }
    },
    handleSwapSubmit: ({ createSwap, searchAddress, isAlreadyInPortfolio, addWalletToPortfolio, receive, handleForward, handleLoading }) => (values) => {
      console.log('values!', values)
      const { symbol, ERC20 } = receive
      const { sendAmount, receiveAddress, refundAddress, sendSymbol, receiveSymbol } = values
      let id = ''
      handleLoading(true)
      createSwap({ id: uuid(), sendAmount: toBigNumber(sendAmount), receiveAddress, refundAddress, sendSymbol, receiveSymbol })
        .then((s) => { 
          id = s.id
          console.log('id!', id)
          return searchAddress(receiveAddress)})
        .then(() => {
          if (!isAlreadyInPortfolio && symbol === 'ETH' || ERC20) { 
            return addWalletToPortfolio(`swap?id=${id}`) 
          }
          return handleForward(id)
        })
        .catch(e => console.log(e))

    },
  })
)(SwapStepOne)

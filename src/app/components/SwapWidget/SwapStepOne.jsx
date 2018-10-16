import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withStateHandlers, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
import classNames from 'class-names'
import { reduxForm, change, getFormSyncErrors } from 'redux-form'
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
import WalletSelectField from 'Components/WalletSelectField'
import { Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody, InputGroupAddon } from 'reactstrap'
import web3 from 'Services/Web3'
import { container, section, submitButton, asset, icon, receive, swap, expnd, assetAddOnError, assetAddOn } from './style.scss'
import { toBigNumber } from 'Utilities/convert'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { Address } from 'bitcore-lib'
import { createManualSwap } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { searchAddress, addToPortfolio } from 'Actions/accountSearch'
import { getWalletForAsset } from 'Utilities/wallet'
import PropTypes from 'prop-types'


const SwapStepOne = ({ isPopUpOpen, handlePopUp, supportedAssets, handleSendAmountValidation,
  sendSymbol, receiveSymbol, handleSelectedAsset, handleSwitchAssets,handleReceiveAddressValidation, 
  handleReturnAddressValidation, handleSwapSubmit, isLoadingSwap,handleReceiveWalletSelect, 
  handleRefundWalletSelect, formErrors }) => (
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
          <Button color='ultra-dark' className={classNames('flat', swap)} onClick={handleSwitchAssets}><SwapIcon/></Button>
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
            handleReceiveWalletSelect={handleReceiveWalletSelect}
            handleRefundWalletSelect={handleRefundWalletSelect}
            handleSendAmountValidation={handleSendAmountValidation}
            isLoadingSwap={isLoadingSwap}
            formErrors={formErrors}
          />
        </CardBody>
        <Modal size='lg' isOpen={isPopUpOpen} toggle={() => handlePopUp(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
          <ModalHeader toggle={() => handlePopUp(null)} tag='h4' className='text-primary'>
            Add Asset
          </ModalHeader>
          <ModalBody>
            {isPopUpOpen && (
              <AssetSelector selectAsset={(asset) => handleSelectedAsset(asset, sendSymbol, receiveSymbol)} supportedAssetSymbols={supportedAssets}/>
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
  updateUnregisteredFields: true,
})(({ handleSubmit, handleRefundWalletSelect, handleReceiveWalletSelect, invalid, sendSymbol, receiveSymbol, 
  handleReturnAddressValidation, handleReceiveAddressValidation, isLoadingSwap, handleSendAmountValidation, 
  formErrors }) => (
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
      <WalletSelectField 
        row
        className='gutter-3 align-items-center'
        id='receiveAddress'
        name='receiveAddress'
        placeholder={`${receiveSymbol} Receive Address`}
        autoFocus
        autoCorrect='false'
        autoCapitalize='false'
        spellCheck='false'
        labelProps={{ xs: '12', md: '4' }}
        inputCol={{ xs:'12', md: true }}
        validate={handleReceiveAddressValidation}
        inputClass={classNames('flat', receive)}
        dropDownText={`${receiveSymbol} Wallets`}
        handleSelect={handleReceiveWalletSelect}
        symbol={receiveSymbol}
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
          validate={handleSendAmountValidation}
          inputClass='flat'
          addonAppend={(
            <InputGroupAddon className={formErrors.sendAmount ? assetAddOnError : assetAddOn} addonType="append">{sendSymbol}</InputGroupAddon>
          )}
        />
        <Expandable
          className={expnd}
          shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
          expanded={'If deposit amount is omitted, the amount you receive will be calculated based on amount you deposit'}>
        </Expandable>
      </div>
      <div style={{ position: 'relative' }}>
        <WalletSelectField 
          row
          className='gutter-3 align-items-center'
          id='refundAddress'
          name='refundAddress'
          placeholder={`${sendSymbol} Return Address (optional)`}
          autoCorrect='false'
          autoCapitalize='false'
          spellCheck='false'
          autoFocus
          labelProps={{ xs: '12', md: '4' }}
          inputCol={{ xs:'12', md: true }}
          validate={handleReturnAddressValidation}
          inputClass='flat'
          dropDownText={`${sendSymbol} Wallets`}
          handleSelect={handleRefundWalletSelect}
          symbol={sendSymbol}
        />
         <Expandable 
          className={expnd}
          shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
          expanded={'This address will be used in the case that your funds need to be returned'}>
        </Expandable>
      </div>
    </div>
    <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit' disabled={invalid || isLoadingSwap}>
      {!isLoadingSwap ? 'Create Swap' : 'Generating Swap...' }
    </Button>
  </Form>
  )
)

export default compose(
  setDisplayName('SwapStepOne'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio,
    formErrors: (state) => getFormSyncErrors('swapWidget')(state),
  }), {
    createSwap: createManualSwap,
    searchAddress: searchAddress,
    addWalletToPortfolio: addToPortfolio,
    push: pushAction,
    change: change,
    updateQueryString: updateQueryStringReplace,
  }),
  setPropTypes({
    sendSymbol: PropTypes.string, 
    receiveSymbol: PropTypes.string,
    depositAmount: PropTypes.number,
    receiveAddr: PropTypes.string,
    refundAddr: PropTypes.string,
  }),
  defaultProps({
    sendSymbol: 'BTC',
    receiveSymbol: 'ETH',
    depositAmount: null,
    receiveAddr: undefined,
    refundAddr: undefined,
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
    { isPopUpOpen: false, assetType: null },
    { 
      handlePopUp: ({ isPopUpOpen }) => (type) => ({ isPopUpOpen: !isPopUpOpen, assetType: type }),
    }),
  withState('isLoadingSwap', 'handleLoading', false),
  connect(createStructuredSelector({
    deposit: (state, { sendSymbol }) => getAsset(state, sendSymbol),
    receive: (state, { receiveSymbol }) => getAsset(state, receiveSymbol)
  })),
  withHandlers({
    handleForward: ({ push }) => (orderId) => push(`/swap?id=${orderId}`),
  }),
  withHandlers({
    handleSelectedAsset: ({ assetType, updateQueryString, handlePopUp }) => (asset, to, from) => {
      const { symbol } = asset
      let receiveSymbol = from
      let sendSymbol = to
      if (assetType === 'deposit' && (symbol != receiveSymbol)) {
        sendSymbol = symbol
      } else if (assetType === 'deposit' && (symbol === receiveSymbol)) {
        sendSymbol = symbol
        receiveSymbol = from
      } else if (assetType === 'receive' && (symbol != sendSymbol)) {
        receiveSymbol = symbol
      } else {
        sendSymbol = to
        receiveSymbol = symbol
      }
      updateQueryString({ search: `from=${sendSymbol}&to=${receiveSymbol}` })
      handlePopUp()
    },
    handleSwitchAssets: ({ updateQueryString, sendSymbol, receiveSymbol }) => () => {
      updateQueryString({ search: `from=${receiveSymbol}&to=${sendSymbol}` })
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
    handleSendAmountValidation: () => (sendAmount) => {
      if (sendAmount && (sendAmount <= 0 || isNaN(sendAmount))) {
        return 'Please enter a deposit amount greater than 0 or omit'
      }
    },
    handleReceiveWalletSelect: ({ change }) => (symbol, address) => {
      if (symbol === 'BTC') {
        const walletInstance = getWalletForAsset(address, symbol)
        return walletInstance.getFreshAddress(symbol)
        .then((wallet) => {
          change('swapWidget', 'receiveAddress', wallet)
        })
      } else {
        change('swapWidget', 'receiveAddress', address)
      }
    },
    handleRefundWalletSelect: ({ change }) => (symbol, address) => {
      if (symbol === 'BTC') {
        const walletInstance = getWalletForAsset(address, symbol)
        return walletInstance.getFreshAddress(symbol)
        .then((wallet) => {
          change('swapWidget', 'refundAddress', wallet)
        })
      } else {
        change('swapWidget', 'refundAddress', address)
      }
     
    },
    handleSwapSubmit: ({ createSwap, searchAddress, isAlreadyInPortfolio, addWalletToPortfolio, receive, handleForward, handleLoading }) => (values) => {
      const { symbol, ERC20 } = receive
      const { sendAmount, receiveAddress, refundAddress, sendSymbol, receiveSymbol } = values
      handleLoading(true)
      createSwap({ sendAmount: toBigNumber(sendAmount), receiveAddress, refundAddress, sendSymbol, receiveSymbol })
        .then((swap) => { 
          return searchAddress(receiveAddress)
            .then(() => {
              if (!isAlreadyInPortfolio && symbol === 'ETH' || ERC20) { 
                return addWalletToPortfolio(`/swap?id=${swap.orderId}`) 
              }
              return handleForward(swap.orderId)
            })
        })
        .catch(() => {
          handleLoading(false)
        })
    },
  }),
  lifecycle({
    componentWillUpdate() {
      const { receiveAddr, depositAmount, refundAddr, change } = this.props
      change('swapWidget', 'receiveAddress', receiveAddr)
      change('swapWidget', 'sendAmount', depositAmount)
      change('swapWidget', 'refundAddress', refundAddr)
    }
  })
)(SwapStepOne)

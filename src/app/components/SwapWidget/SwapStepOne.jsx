import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { compose, setDisplayName, withProps, withState, withHandlers, setPropTypes, defaultProps, lifecycle } from 'recompose'
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
import WalletSelectField from 'Components/WalletSelectField'
import { Form, Button, Modal, ModalHeader, ModalBody, Card, CardHeader, CardBody, InputGroupAddon } from 'reactstrap'
import { container, section, submitButton, asset, icon, receive, swap, expnd, assetAddOnError, assetAddOn } from './style.scss'
import { toBigNumber } from 'Utilities/convert'
import SwapIcon from 'Img/swap-icon.svg?inline'
import { createManualSwap } from 'Actions/swap'
import { updateQueryStringReplace } from 'Actions/router'
import { searchAddress, addToPortfolio } from 'Actions/accountSearch'
import PropTypes from 'prop-types'
import * as validator from 'Utilities/validator'

const DEFAULT_DEPOSIT = 'BTC'
const DEFAULT_RECEIVE = 'ETH'

const SwapStepOne = ({
  change, submitting, invalid,
  depositSymbol, receiveSymbol, supportedAssets, assetSelect, setAssetSelect, 
  validateReceiveAddress, validateRefundAddress, validateDepositAmount,
  handleSubmit, handleSelectedAsset, handleSwitchAssets, 
}) => (
  <Fragment>
    <ProgressBar steps={['Create Swap', `Deposit ${depositSymbol}`, `Receive ${receiveSymbol}`]} currentStep={0}/>
    <Card className={classNames('container justify-content-center p-0', container)}>
      <CardHeader className='text-center pb-4'>
        <h4 className='mb-3 mt-1'>Swap Instantly</h4>
        <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => setAssetSelect('deposit')}>
          <div className={asset}>
            <CoinIcon key={depositSymbol} symbol={depositSymbol} style={{ width: 48, height: 48 }} className='m-1'/>
            <h4 className='m-0'>{depositSymbol}</h4>
            <p>Deposit</p>
          </div>
        </Button>
        <Button color='ultra-dark' className={classNames('flat', swap)} onClick={handleSwitchAssets}><SwapIcon/></Button>
        <Button color='ultra-dark' className='flat mb-3 p-0' onClick={() => setAssetSelect('receive')}>
          <div className={asset}>
            <CoinIcon key={receiveSymbol} symbol={receiveSymbol} style={{ width: 48, height: 48 }} className='m-1'/>
            <h4 className='m-0'>{receiveSymbol}</h4>
            <p>Receive</p>
          </div>
        </Button>
      </CardHeader>
      <CardBody className='pt-1'>
        <Form onSubmit={handleSubmit}>
          <div className={section}>
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
              validate={validateReceiveAddress}
              inputClass={classNames('flat', receive)}
              dropDownText={`${receiveSymbol} Wallets`}
              symbol={receiveSymbol}
              change={change}
            />
            <div style={{ position: 'relative' }}>
              <ReduxFormField
                row
                className='gutter-3 align-items-center'
                id='depositAmount'
                name='depositAmount'
                type='number'
                placeholder={`${depositSymbol} Deposit Amount (optional)`}
                autoCorrect='false'
                autoCapitalize='false'
                spellCheck='false'
                labelProps={{ xs: '12', md: '4' }}
                inputCol={{ xs:'12', md: true }}
                validate={validateDepositAmount}
                inputClass='flat'
                addonAppend={({ meta: { touched, error } }) => (
                  <InputGroupAddon className={touched && error ? assetAddOnError : assetAddOn} addonType="append">{depositSymbol}</InputGroupAddon>
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
                placeholder={`${depositSymbol} Return Address (optional)`}
                autoCorrect='false'
                autoCapitalize='false'
                spellCheck='false'
                labelProps={{ xs: '12', md: '4' }}
                inputCol={{ xs:'12', md: true }}
                validate={validateRefundAddress}
                inputClass='flat'
                dropDownText={`${depositSymbol} Wallets`}
                symbol={depositSymbol}
                change={change}
              />
              <Expandable 
                className={expnd}
                shrunk={<i className={classNames('fa fa-question-circle', icon)}></i>} 
                expanded={'This address will be used in the case that your funds need to be returned'}>
              </Expandable>
            </div>
          </div>
          <Button className={classNames('mt-2 mb-2 mx-auto', submitButton)} color='primary' type='submit' disabled={invalid || submitting}>
            {!submitting ? 'Create Swap' : 'Generating Swap...' }
          </Button>
        </Form>
      </CardBody>
      <Modal size='lg' isOpen={assetSelect} toggle={() => setAssetSelect(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
        <ModalHeader toggle={() => setAssetSelect(null)} tag='h4' className='text-primary'>
          Add Asset
        </ModalHeader>
        <ModalBody>
          {assetSelect && (
            <AssetSelector selectAsset={handleSelectedAsset} supportedAssetSymbols={supportedAssets}/>
          )}
        </ModalBody>
      </Modal>
    </Card>
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
    refundAddress: null,
  }),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    isAlreadyInPortfolio: isAccountSearchResultWalletInPortfolio,
    depositAsset: (state, { depositSymbol }) => getAsset(state, depositSymbol),
    receiveAsset: (state, { receiveSymbol }) => getAsset(state, receiveSymbol),
  }), {
    createSwap: createManualSwap,
    searchAddress: searchAddress,
    addWalletToPortfolio: addToPortfolio,
    push: pushAction,
    updateQueryString: updateQueryStringReplace,
  }),
  withProps(({ assets, receiveAddress, depositAmount, refundAddress }) => ({
    supportedAssets: assets.map(({ symbol }) => symbol),
    initialValues: {
      receiveAddress,
      depositAmount,
      refundAddress
    },
  })),
  withState('assetSelect', 'setAssetSelect', null), // deposit, receive, or null
  withHandlers({
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
    validateReceiveAddress: ({ receiveAsset }) => validator.all(validator.required(), validator.walletAddress(receiveAsset)),
    validateRefundAddress: ({ depositAsset }) => validator.walletAddress(depositAsset),
    validateDepositAmount: () => validator.all(validator.number(), validator.greaterThan(0)),
    onSubmit: ({
      depositSymbol, receiveAsset, 
      createSwap, searchAddress, isAlreadyInPortfolio, addWalletToPortfolio, push
    }) => (values) => {
      const { symbol: receiveSymbol, ERC20 } = receiveAsset
      const { depositAmount, receiveAddress, refundAddress } = values
      return createSwap({ sendAmount: toBigNumber(depositAmount), receiveAddress, refundAddress, sendSymbol: depositSymbol, receiveSymbol })
        .then((swap) => { 
          return searchAddress(receiveAddress)
            .then(() => {
              if (!isAlreadyInPortfolio && receiveSymbol === 'ETH' || ERC20) { 
                return addWalletToPortfolio(`/swap?id=${swap.orderId}`) 
              }
              return push(`/swap?id=${swap.orderId}`)
            })
        })
    },
  }),
  lifecycle({
    componentWillMount() {
      const { updateQueryString, depositSymbol, receiveSymbol } = this.props
      if (depositSymbol === receiveSymbol) {
        let to = DEFAULT_RECEIVE
        if (to === depositSymbol) {
          to = DEFAULT_DEPOSIT
        }
        updateQueryString({ to })
      }
    }
  }),
  reduxForm({
    form: 'swapWidget',
    enableReinitialize: true,
    keepDirtyOnReinitialize: true,
    updateUnregisteredFields: true,
  }),
)(SwapStepOne)

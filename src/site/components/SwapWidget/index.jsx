import React, { Fragment } from 'react'
import { compose, setDisplayName, lifecycle, withHandlers, withProps, withState } from 'recompose'
import { connect } from 'react-redux'
import { push as pushAction } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, CardBody, Button, Form, Modal, ModalHeader,
  ModalBody } from 'reactstrap'
import { swapContainer, submitButton, asset, swap } from './style.scss'

import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'

import { retrieveAssets } from 'Actions/asset'
import { getAllAssetsArray } from 'Selectors/asset'

import classNames from 'class-names'
import SwapIcon from 'Img/swap-icon.svg?inline'

const DEFAULT_DEPOSIT = 'BTC'
const DEFAULT_RECEIVE = 'ETH'

const SwapWidget = ({ onSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, 
  supportedAssets, assetSelect, setAssetSelect, depositSymbol, receiveSymbol }) => {
  return (
    <Fragment>
      <Card style={{ maxWidth: '650px' }} className={classNames('container justify-content-center p-0', swapContainer)}>
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
          <Form>
            <Button 
              className={classNames('mt-2 mb-2 mx-auto', submitButton)} 
              color='primary'
              onClick={onSubmit}
              type='submit'
            >
              Continue
            </Button>
          </Form>
        </CardBody>
      </Card>
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
}

export default compose(
  setDisplayName('SwapWidget'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray
  }), {
    retrieveAssets: retrieveAssets,
    push: pushAction
  }),
  withProps(({ assets }) => ({
    supportedAssets: assets.map(({ symbol }) => symbol),
  })),
  withState('assetSelect', 'setAssetSelect', null), // deposit, receive, or null
  withState('depositSymbol', 'setDepositSymbol', DEFAULT_DEPOSIT),
  withState('receiveSymbol', 'setReceiveSymbol', DEFAULT_RECEIVE),
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
    onSubmit: ({ depositSymbol, receiveSymbol, push }) => () => {
      push(`/app/swap?from=${depositSymbol}&to=${receiveSymbol}`)
    }
  }),
  lifecycle({
    componentWillMount() {
      const { retrieveAssets } = this.props
      retrieveAssets()
    }
  })
)(SwapWidget)
import React, { Fragment } from 'react'
import { compose, setDisplayName, withHandlers, withProps, withState } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, Button, Modal, ModalHeader,
  ModalBody } from 'reactstrap'
import { swapContainer, cardHeader, cardTitle, submitButton, asset, swap } from './style.scss'

import { areAssetsLoaded } from 'Common/selectors/asset'

import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'

import classNames from 'class-names'
import SwapIcon from 'Img/swap-icon.svg?inline'

const DEFAULT_DEPOSIT = 'BTC'
const DEFAULT_RECEIVE = 'ETH'

const SwapWidget = ({ onSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, 
  supportedAssets, assetSelect, setAssetSelect, depositSymbol, receiveSymbol, areAssetsLoaded }) => {
  return (
    <Fragment>
      <Card 
        style={{ maxWidth: '485px', height: '350px', boxShadow: '10px 15px 10px 5px rgba(0,0,0,0.2)' }} 
        className={classNames('container justify-content-center p-0 border-0', swapContainer)}
      >
        <CardHeader style={{ background: '#fff' }} className={classNames('text-center pb-4 h-100', cardHeader)}>
          <h4 style={{ fontSize: 25 }} className={classNames('mb-4 mt-3', cardTitle)}>Swap Instantly</h4>
          <Button 
            style={{ background: '#F2F5FB', color: '#8796BF' }} 
            className={classNames('flat mt-2 mb-5 p-0 border-0', asset)} 
            onClick={() => setAssetSelect('deposit')}
          >
            {areAssetsLoaded ? (
              <div className={classNames('pt-1', asset)}>
                <CoinIcon key={depositSymbol} symbol={depositSymbol} style={{ width: 60, height: 60 }} className='mt-4 mb-2'/>
                <h4 style={{ fontWeight: 600 }} className='m-0'>{depositSymbol}</h4>
                <p className='mt-2'>You send</p>
              </div>
            ) : (
              <i className='fa fa-spinner fa-pulse'/>
            )}
          </Button>
          <Button className={classNames('flat', swap)} onClick={handleSwitchAssets}>
            <SwapIcon className='position-relative' style={{ fill: '#b7beca', width: 20, top: -10 }}/>
          </Button>
          <Button 
            style={{ background: '#F2F5FB', color: '#8796BF' }} 
            className={classNames('flat mt-2 mb-5 p-0 border-0', asset)} 
            onClick={() => setAssetSelect('receive')}
          >
            {areAssetsLoaded ? (
              <div className={classNames('pt-1', asset)}>
                <CoinIcon key={receiveSymbol} symbol={receiveSymbol} style={{ width: 60, height: 60 }} className='mt-4 mb-2'/>
                <h4 style={{ fontWeight: 600 }} className='m-0'>{receiveSymbol}</h4>
                <p className='mt-2'>You receive</p>
              </div>
            ) : (
              <i className='fa fa-spinner fa-pulse'/>
            )}
          </Button>
          <Button 
            tag='a'
            href={`/app/swap?from=${depositSymbol}&to=${receiveSymbol}`}
            className={classNames('mt-1 mb-2 mx-auto flat', submitButton)} 
            color='primary'
            onClick={onSubmit}
          >
              Continue
          </Button>
        </CardHeader>
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
    areAssetsLoaded
  }), {
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
    }
  })
)(SwapWidget)

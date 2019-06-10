import React, { Fragment } from 'react'
import { compose, setDisplayName, withHandlers, withProps, withState, setPropTypes, defaultProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Card, CardHeader, Button, Modal, ModalHeader,
  ModalBody, Row, Col } from 'reactstrap'
import { swapContainer, cardHeader, cardTitle, submitButton, asset, swap } from './style.scss'

import { areAssetsLoaded } from 'Common/selectors/asset'

import GAEventButton from 'Components/GAEventButton'
import CoinIcon from 'Components/CoinIcon'
import AssetSelector from 'Components/AssetSelector'

import classNames from 'class-names'
import PropTypes from 'prop-types'
import SwapIcon from 'Img/swap-icon.svg?inline'

const SwapWidget = ({ onSubmit, handleSelectedAsset, isAssetDisabled, handleSwitchAssets, 
  supportedAssets, assetSelect, setAssetSelect, depositSymbol, receiveSymbol, areAssetsLoaded, translations: { static: { swapWidget = {} } = {} } }) => {
  return (
    <Fragment>
      <Card 
        style={{ maxWidth: '485px', minHeight: '350px', boxShadow: '10px 15px 10px 5px rgba(0,0,0,0.2)' }} 
        className={classNames('container justify-content-center p-0 border-0', swapContainer)}
      >
        <CardHeader style={{ background: '#fff' }} className={classNames('text-center pb-4 h-100', cardHeader)}>
          <h4 style={{ fontSize: 25 }} className={classNames('mb-4 mt-3', cardTitle)}>{swapWidget.swapInstantly}</h4>
          <Row style={{ justifyContent: 'space-around' }}>
            <Col sm='12' md='5' className='pl-md-5 pl-0 pr-0'>
              <Button 
                style={{ background: '#F2F5FB', color: '#8796BF' }} 
                className={classNames('flat mt-2 mb-5 p-0 border-0', asset)} 
                onClick={() => setAssetSelect('deposit')}
              >
                {areAssetsLoaded ? (
                  <div className={classNames('pt-1', asset)}>
                    <CoinIcon key={depositSymbol} symbol={depositSymbol} style={{ width: 60, height: 60 }} className='mt-4 mb-2'/>
                    <h4 style={{ fontWeight: 600 }} className='m-0'>{depositSymbol}</h4>
                    <p className='mt-2'>{swapWidget.youSend}</p>
                  </div>
                ) : (
                  <i className='fa fa-spinner fa-pulse'/>
                )}
              </Button>
            </Col>
            <Col sm='12' md='2' style={{ alignSelf: 'center' }}>
              <Button className={classNames('flat p-0', swap)} onClick={handleSwitchAssets}>
                <SwapIcon className='position-relative' style={{ fill: '#b7beca', width: 20, top: -10 }}/>
              </Button>
            </Col>
            <Col sm='12' md='5' className='pr-md-5 pr-0 pl-0'>
              <Button 
                style={{ background: '#F2F5FB', color: '#8796BF' }} 
                className={classNames('flat mt-2 mb-5 p-0 border-0', asset)} 
                onClick={() => setAssetSelect('receive')}
              >
                {areAssetsLoaded ? (
                  <div className={classNames('pt-1', asset)}>
                    <CoinIcon key={receiveSymbol} symbol={receiveSymbol} style={{ width: 60, height: 60 }} className='mt-4 mb-2'/>
                    <h4 style={{ fontWeight: 600 }} className='m-0'>{receiveSymbol}</h4>
                    <p className='mt-2'>{swapWidget.youReceive}</p>
                  </div>
                ) : (
                  <i className='fa fa-spinner fa-pulse'/>
                )}
              </Button>
            </Col>
          </Row>
          <GAEventButton 
            tag={Button}
            event={{ category: 'Static', action: 'Go to Swap' }}
            href={`/app/swap?from=${depositSymbol}&to=${receiveSymbol}`}
            className={classNames('mt-1 mb-2 mx-auto flat', submitButton)} 
            color='primary'
            onClick={onSubmit}
          >
            {swapWidget.continue}
          </GAEventButton>
        </CardHeader>
      </Card>
      <Modal size='lg' isOpen={Boolean(assetSelect)} toggle={() => setAssetSelect(null)} className='m-0 mx-md-auto' contentClassName='p-0'>
        <ModalHeader toggle={() => setAssetSelect(null)} tag='h4' className='text-primary'>
          <span>{assetSelect === 'deposit' ? swapWidget.chooseSend : swapWidget.chooseReceive}</span>
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

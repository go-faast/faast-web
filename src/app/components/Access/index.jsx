import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import CoinIcon from 'Components/CoinIcon'
import Web3Wallet from './Web3Wallet'
import CreateWallet from './CreateWallet'
import ImportKeystore from './ImportKeystore'
import HardwareWallet from './HardwareWallet'
import AddressSearch from './AddressSearch'

import T from 'Components/i18n/T'

const TileRow = ({ children }) => (<div className='my-3'><Row className='gutter-4 justify-content-center'>{children}</Row></div>)
const TileCol = ({ children }) => (<Col xs='9' sm='6' md='4' lg='3'>{children}</Col>)

const MOBILE_ORDER = 'order-1 order-md-2'
const DESKTOP_ORDER = 'order-2 order-md-1'

const Access = ({ forwardurl }) => (
  <div className='text-center'>
    <T tag='h3' i18nKey='app.connect.select' className='mt-lg-3'>Select your wallets</T>
    <Row className='no-gutters'>
      <Col xs='12' className={DESKTOP_ORDER}>
        <T tag='h4' i18nKey='app.connect.hardware' className='text-muted mt-4'>Hardware Wallets</T>
        <T tag='h6' i18nKey='app.connect.recommended' className='text-primary'>Recommended</T>
        <TileRow>
          <TileCol><HardwareWallet type='trezor' /></TileCol>
          <TileCol><HardwareWallet type='ledger' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={DESKTOP_ORDER}>
        <T tag='h4' i18nKey='app.connect.desktopWallets' className='text-muted'>
          <CoinIcon symbol='ETH' size='sm' inline /> Ethereum Desktop Wallets
        </T>
        <TileRow>
          <TileCol><Web3Wallet forwardurl={forwardurl} type='metamask' /></TileCol>
          <TileCol><Web3Wallet forwardurl={forwardurl} type='mist' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={MOBILE_ORDER}>
        <T tag='h4' i18nKey='app.connect.mobileWallets' className='text-muted'>
          <CoinIcon symbol='ETH' size='sm' inline /> Ethereum Mobile Wallets
        </T>
        <TileRow>
          <TileCol><Web3Wallet forwardurl={forwardurl} type='trust' /></TileCol>
          <TileCol><Web3Wallet forwardurl={forwardurl} type='coinbase' /></TileCol>
          <TileCol><Web3Wallet forwardurl={forwardurl} type='status' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={MOBILE_ORDER}>
        <T tag='h4' i18nKey='app.connect.manual' className='text-muted'>Manual</T>
        <TileRow>
          <TileCol><CreateWallet /></TileCol>
          <TileCol><ImportKeystore /></TileCol>
          <div className='w-100'/>
          <Col xs='9' sm='12' md='8' lg='6'><AddressSearch inputProps={{ style: { height: 53 } }} /></Col>
        </TileRow>
      </Col>
    </Row>
    <Button style={{ marginTop: '100px' }} color='ultra-dark'
      tag='a' href='https://github.com/go-faast/faast-web'
      target='_blank' rel='noopener noreferrer'>
      <i className='fa fa-github fa-2x align-middle'/>
      <T tag='span' i18nKey='app.connect.openSource' className='px-3'>open source and secure</T>
      <i className='fa fa-lock fa-2x align-middle'/>
    </Button>
  </div>
)

export default Access

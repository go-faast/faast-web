import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import CoinIcon from 'Components/CoinIcon'
import Web3Wallet from './Web3Wallet'
import CreateWallet from './CreateWallet'
import ImportKeystore from './ImportKeystore'
import HardwareWallet from './HardwareWallet'
import AddressSearch from './AddressSearch'

const TileRow = ({ children }) => (<div className='my-3'><Row className='gutter-4 justify-content-center'>{children}</Row></div>)
const TileCol = ({ children }) => (<Col xs='9' sm='6' md='4' lg='3'>{children}</Col>)

const MOBILE_ORDER = 'order-1 order-md-2'
const DESKTOP_ORDER = 'order-2 order-md-1'

const Access = () => (
  <div className='text-center'>
    <h3 className='mt-lg-3'>Select your wallets</h3>
    <Row className='no-gutters'>
      <Col xs='12' className={DESKTOP_ORDER}>
        <h4 className='text-muted mt-4'>Hardware Wallets</h4>
        <h6 className='text-primary'>Recommended</h6>
        <TileRow>
          <TileCol><HardwareWallet type='trezor' /></TileCol>
          <TileCol><HardwareWallet type='ledger' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={DESKTOP_ORDER}>
        <h4 className='text-muted'><CoinIcon symbol='ETH' size='sm' inline /> Ethereum Desktop Wallets</h4>
        <TileRow>
          <TileCol><Web3Wallet type='metamask' /></TileCol>
          <TileCol><Web3Wallet type='mist' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={MOBILE_ORDER}>
        <h4 className='text-muted'><CoinIcon symbol='ETH' size='sm' inline /> Ethereum Mobile Wallets</h4>
        <TileRow>
          <TileCol><Web3Wallet type='trust' /></TileCol>
          <TileCol><Web3Wallet type='coinbase' /></TileCol>
          <TileCol><Web3Wallet type='status' /></TileCol>
        </TileRow>
      </Col>
      <Col xs='12' className={MOBILE_ORDER}>
        <h4 className='text-muted'>Manual</h4>
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
      <span className='px-3'>open source and secure</span>
      <i className='fa fa-lock fa-2x align-middle'/>
    </Button>
  </div>
)

export default Access

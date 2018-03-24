import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Layout from 'Components/Layout'
import CoinIcon from 'Components/CoinIcon'
import AddressSearch from 'Components/AddressSearch'

import Web3Wallet from './Web3Wallet'
import Blockstack from './Blockstack'
import CreateWallet from './CreateWallet'
import ImportKeystore from './ImportKeystore'
import HardwareWallet from './HardwareWallet'

import { isDefaultPortfolioEmpty } from 'Selectors'

const TileRow = ({ children }) => (<div className='my-3'><Row className='gutter-4 justify-content-center'>{children}</Row></div>)
const TileCol = ({ children }) => (<Col xs='9' sm='6' md='4' lg='3'>{children}</Col>)

const Access = () => (
  <Layout className='text-center pt-3'>
    <h3 className='mt-lg-3'>Select your wallet</h3>
    <h4 className='text-muted mt-4'>Hardware Wallets</h4>
    <h6 className='text-primary'>Recommended</h6>
    <TileRow>
      <TileCol><HardwareWallet type='trezor' /></TileCol>
      <TileCol><HardwareWallet type='ledger' /></TileCol>
    </TileRow>
    <h4 className='text-muted'>Software Wallets</h4>
    <h6><CoinIcon symbol='ETH' size='sm' inline /> Ethereum only</h6>
    <TileRow>
      <TileCol><Web3Wallet type='metamask' /></TileCol>
      <TileCol><Web3Wallet type='mist' /></TileCol>
      <TileCol><Web3Wallet type='parity' /></TileCol>
      <TileCol><Blockstack /></TileCol>
    </TileRow>
    <h4 className='text-muted'>Manual</h4>
    <TileRow>
      <TileCol><CreateWallet /></TileCol>
      <TileCol><ImportKeystore /></TileCol>
      <div className='w-100'/>
      <Col xs='9' sm='12' md='8' lg='6'><AddressSearch /></Col>
    </TileRow>
    <Button style={{ marginTop: '100px' }} color='ultra-dark'
      tag='a' href='https://github.com/go-faast/faast-portfolio'
      target='_blank' rel='noopener noreferrer'>
      <i className='fa fa-github fa-2x align-middle'/>
      <span className='px-3'>open source and secure</span>
      <i className='fa fa-lock fa-2x align-middle'/>
    </Button>
  </Layout>
)

export default connect(createStructuredSelector({
  disablePortfolioAccess: isDefaultPortfolioEmpty,
}))(Access)

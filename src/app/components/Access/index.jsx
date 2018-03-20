import React from 'react'
import { Row, Col, Button } from 'reactstrap'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'

import Layout from 'Components/Layout'
import Keystore from 'Components/Keystore'
import Web3Wallet from 'Components/Web3Wallet'
import CreateWallet from 'Components/CreateWallet'
import HardwareWallet from 'Components/HardwareWallet'
import Blockstack from 'Components/Blockstack'

import { isDefaultPortfolioEmpty } from 'Selectors'

const TileRow = ({ children }) => (<div className='my-3'><Row className='gutter-4 justify-content-center'>{children}</Row></div>)
const TileCol = ({ children }) => (<Col xs='9' sm='6' md='4' lg='3'>{children}</Col>)

const Access = ({ disablePortfolioAccess }) => (
  <Layout showAddressSearch view='connect'>
    <Row className='gutter-3 justify-content-end'>
      <Col xs='auto'>
        <Button color='faast' tag={Link} to='/balances' disabled={disablePortfolioAccess}>portfolio</Button>
      </Col>
    </Row>
    <div className='text-center'>
      <h3 className='mt-5'>Select your wallet</h3>
      <h4 className='text-grey mt-4'>Hardware Wallets</h4>
      <h6 className='text-primary'>Recommended</h6>
      <TileRow>
        <TileCol><HardwareWallet type='trezor' /></TileCol>
        <TileCol><HardwareWallet type='ledger' /></TileCol>
      </TileRow>
      <h4 className='text-grey'>Software Wallets</h4>
      <TileRow>
        <TileCol><Web3Wallet type='metamask' /></TileCol>
        <TileCol><Web3Wallet type='mist' /></TileCol>
        <TileCol><Web3Wallet type='parity' /></TileCol>
        <TileCol><Blockstack /></TileCol>
      </TileRow>
      <h4 className='text-grey'>Manual</h4>
      <TileRow>
        <TileCol><Keystore /></TileCol>
        <TileCol><CreateWallet /></TileCol>
      </TileRow>
      <Button style={{ marginTop: '100px' }} color='ultra-dark'
        tag='a' href='https://github.com/go-faast/faast-portfolio'
        target='_blank' rel='noopener noreferrer'>
        <i className='fa fa-github fa-2x align-middle'/>
        <span className='px-3'>open source and secure</span>
        <i className='fa fa-lock fa-2x align-middle'/>
      </Button>
    </div>
  </Layout>
)

export default connect(createStructuredSelector({
  disablePortfolioAccess: isDefaultPortfolioEmpty,
}))(Access)

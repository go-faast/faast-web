import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { pick } from 'lodash'

const walletInformation = {
  MetaMask: (
    <Fragment>
      MetaMask is a desktop browser extension that provides an Ethereum wallet. You can get it <a href="https://metamask.io/">here.</a>
    </Fragment>
  ),
  Status: (
    <Fragment>
      Status is a mobile Ethereum OS for iOS and Android. You can learn more about it <a href="https://status.im/">here.</a> 
      <p className='mt-2'>If you already have Status, open <a href='https://faa.st'>Faa.st</a> using its built in web browser.</p>
    </Fragment>
  ),
  MistBrowser: (
    <Fragment>
      Mist Browser is a desktop web browser with a built-in Ethereum wallet. You can get it <a href='https://github.com/ethereum/mist'>here.</a>
    </Fragment>
  ),
  CoinbaseWallet: (
    <Fragment>
      Coinbase Wallet is a mobile Ethereum wallet for iOS and Android. 
      You can get it <a href='https://wallet.coinbase.com/'>here.</a>
      <p className='mt-2'>If you already have Coinbase Wallet, open <a href='https://faa.st'>Faa.st</a> using its built in web browser.</p>
    </Fragment>
  )
}

export default compose(
  setDisplayName('WalletInfoModal'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    ...Modal.propTypes,
  }),
  connect(createStructuredSelector({
  }), {
  }),
  lifecycle({
    componentWillMount() {
    }
  })
)(({
  walletType, toggle, ...props,
}) => (
  <Modal
    size='md' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
    {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
      About {walletType}
    </ModalHeader>
    <ModalBody className='p-2 p-sm-3'>
      {walletInformation[walletType.replace(/\s/g, '')]}
    </ModalBody>
  </Modal>
))

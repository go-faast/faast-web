import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Modal, ModalBody, ModalHeader } from 'reactstrap'
import { pick } from 'lodash'

import Icon from 'Components/Icon'
import config from 'Config'

const walletInformation = {
  metamask: (
    <Fragment>
      MetaMask is a desktop browser extension that provides an Ethereum wallet. You can get it <a href={config.walletTypes.metamask.website}>here.</a>
    </Fragment>
  ),
  status: (
    <Fragment>
      Status is a mobile Ethereum OS for iOS and Android. You can learn more about it <a href={config.walletTypes.status.website}>here.</a> 
      <p className='mt-2'>If you already have Status, open <a href='https://faa.st'>Faa.st</a> using its built in web browser.</p>
    </Fragment>
  ),
  mist: (
    <Fragment>
      Mist Browser is a desktop web browser with a built-in Ethereum wallet. You can get it <a href={config.walletTypes.mist.website}>here.</a>
    </Fragment>
  ),
  coinbase: (
    <Fragment>
      Coinbase Wallet is a mobile Ethereum wallet for iOS and Android. 
      You can get it <a href={config.walletTypes.coinbase.website}>here.</a>
      <p className='mt-2'>If you already have Coinbase Wallet, open <a href='https://faa.st'>Faa.st</a> using its built in web browser.</p>
    </Fragment>
  )
}

export default compose(
  setDisplayName('WalletInfoModal'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    ...Modal.propTypes,
  })
)(({
  walletType, toggle, ...props,
}) => (
  <Modal
    size='md' toggle={toggle} className='mt-6 mx-md-auto' contentClassName='p-0'
    {...pick(props, Object.keys(Modal.propTypes))}>
    <ModalHeader tag='h4' toggle={toggle} className='text-primary'>
      <Icon key='icon' src={config.walletTypes[walletType].icon} height='20px' className='m-2' /> About {config.walletTypes[walletType].name}
    </ModalHeader>
    <ModalBody className='p-2 p-sm-3'>
      {walletInformation[walletType]}
    </ModalBody>
  </Modal>
))

import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, lifecycle } from 'recompose'
import { Modal, ModalHeader, ModalBody } from 'reactstrap'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'

import config from 'Config'
import routes from 'Routes'
import { openWeb3Wallet } from 'Actions/access'

import conditionalRedirect from 'Hoc/conditionalRedirect'

export default compose(
  setDisplayName('MobileWalletModal'),
  setPropTypes({
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    walletType: PropTypes.string.isRequired,
  }),
  withRouter,
  connect(null, {
    openWeb3Wallet
  }),
  withProps(({ walletType }) => {
    const walletConfig = config.walletTypes[walletType]
    const isSupportedWallet = !walletConfig.hardware && walletConfig.web3
    return {
      isSupportedWallet,
      walletName: !isSupportedWallet ? '' : walletConfig.name,
    }
  }),
  lifecycle({
    componentWillMount() {
      const { openWeb3Wallet, walletType } = this.props
      openWeb3Wallet(walletType)
    }
  }),
  conditionalRedirect(routes.connect(), ({ isSupportedWallet }) => !isSupportedWallet)
)(({ isOpen, toggle, walletType, walletName }) => (
  <Modal size='md' className='text-center' backdrop='static' isOpen={isOpen} toggle={toggle}>
    <ModalHeader tag='h3' className='text-primary' toggle={toggle}>
      Adding {walletName}
    </ModalHeader>
    <ModalBody>
      <p>Connecting your {walletType} Wallet...</p>
    </ModalBody>
  </Modal>
))

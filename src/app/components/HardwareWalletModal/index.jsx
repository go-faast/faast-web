import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, lifecycle } from 'recompose'
import { Modal, ModalHeader } from 'reactstrap'
import { Switch, Route, withRouter, Redirect } from 'react-router-dom'
import { connect } from 'react-redux'

import config from 'Config'
import routes from 'Routes'
import { reset } from 'Actions/connectHardwareWallet'

import conditionalRedirect from 'Hoc/conditionalRedirect'

import ConnectAsset from './ConnectAsset'
import AssetSelect from './AssetSelect'
import ConfirmAccountSelection from './ConfirmAccountSelection'
import AccountSelect from './AccountSelect'

export default compose(
  setDisplayName('HardwareWalletModal'),
  setPropTypes({
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    walletType: PropTypes.string.isRequired,
  }),
  withRouter,
  connect(null, {
    reset
  }),
  withProps(({ walletType }) => {
    const walletConfig = config.walletTypes[walletType]
    const isSupportedWallet = Boolean(walletConfig)
    return {
      isSupportedWallet,
      walletName: !isSupportedWallet ? '' : walletConfig.name,
      walletSupportedSymbols: !isSupportedWallet ? [] : Object.keys(walletConfig.supportedAssets),
    }
  }),
  lifecycle({
    componentWillUnmount() {
      this.props.reset()
    }
  }),
  conditionalRedirect(routes.connect(), ({ isSupportedWallet }) => !isSupportedWallet)
)(({ isOpen, toggle, walletType, walletName, walletSupportedSymbols }) => (
  <Modal size='md' className='text-center' backdrop='static' isOpen={isOpen} toggle={toggle}>
    <ModalHeader tag='h3' className='text-primary' toggle={toggle}>
      Adding {walletName}
    </ModalHeader>
    <Switch>
      <Route path={routes.connectHwWalletAssetAccounts(walletType)} render={({ match: { params: { assetSymbol } } }) => (
        <AccountSelect walletType={walletType} assetSymbol={assetSymbol}/>
      )}/>
      <Route path={routes.connectHwWalletAssetConfirm(walletType)} render={({ match: { params: { assetSymbol } } }) => (
        <ConfirmAccountSelection walletType={walletType} assetSymbol={assetSymbol}/>
      )}/>
      <Route path={routes.connectHwWalletAsset(walletType)} render={({ match: { params: { assetSymbol } } }) => (
        <ConnectAsset walletType={walletType} assetSymbol={assetSymbol}/>
      )}/>
      <Route path={routes.connectHwWallet(walletType)} render={() => (
        <AssetSelect walletType={walletType} assetSymbols={walletSupportedSymbols} onCancel={toggle} />
      )}/>
      <Redirect to={routes.connect()}/>
    </Switch>
  </Modal>
))

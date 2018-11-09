import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, lifecycle } from 'recompose'
import { Button, ModalBody, ModalFooter } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'

import routes from 'Routes'
import { getAsset } from 'Selectors/asset'
import { isStatusConnected, isStatusReset } from 'Selectors/connectHardwareWallet'
import {
  startConnect, retryConnect, cancelConnect,
} from 'Actions/connectHardwareWallet'
import conditionalRedirect from 'Hoc/conditionalRedirect'

import SwitchPathButton from './SwitchPathButton'
import DerivationPathChanger from './DerivationPathChanger'
import BackButton from './BackButton'
import ConnectionStatus from './ConnectionStatus'
import ConnectionInstructions from './ConnectionInstructions'

export default compose(
  setDisplayName('ConnectAsset'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    assetSymbol: PropTypes.string.isRequired,
  }),
  connect(createStructuredSelector({
    isConnected: isStatusConnected,
    isReset: isStatusReset,
    asset: (state, { assetSymbol }) => getAsset(state, assetSymbol)
  }), {
    start: startConnect,
    retry: retryConnect,
    routerPush: push,
    handleBack: cancelConnect,
  }),
  withProps(({ walletType, assetSymbol }) => ({
    continuePath: routes.connectHwWalletAssetConfirm(walletType, assetSymbol),
  })),
  conditionalRedirect(
    ({ walletType }) => routes.connectHwWallet(walletType),
    ({ asset }) => !asset),
  lifecycle({
    componentWillMount() {
      const { isReset, start, walletType, assetSymbol } = this.props
      if (isReset) {
        start(walletType, assetSymbol)
      }
    }
  })
)(({
  walletType, assetSymbol, asset, handleBack, continuePath, isConnected, 
}) => (
  <div>
    <ModalBody className='py-4'>
      <ConnectionStatus />
      <ConnectionInstructions type={walletType} asset={asset}/>
      <div className='my-3 w-50 mx-auto'>
        <div className='mb-3'>
          <SwitchPathButton walletType={walletType} assetSymbol={assetSymbol}/>
        </div>
        <DerivationPathChanger />
      </div>
    </ModalBody>
    <ModalFooter>
      <BackButton onClick={handleBack}>Back</BackButton>
      <Button tag={Link} to={continuePath} color='success' disabled={!isConnected}>Continue</Button>
    </ModalFooter>
  </div>
))

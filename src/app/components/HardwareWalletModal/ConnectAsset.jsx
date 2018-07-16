import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, lifecycle } from 'recompose'
import { Button, ModalBody, ModalFooter } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'

import routes from 'Routes'
import { isStatusConnected, isStatusReset } from 'Selectors/connectHardwareWallet'
import {
  startConnect, retryConnect, cancelConnect,
} from 'Actions/connectHardwareWallet'

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
    isReset: isStatusReset
  }), {
    start: startConnect,
    retry: retryConnect,
    routerPush: push,
    handleBack: cancelConnect,
  }),
  withProps(({ walletType, assetSymbol }) => ({
    continuePath: routes.connectHwWalletAssetConfirm(walletType, assetSymbol),
  })),
  lifecycle({
    componentWillMount() {
      const { isReset, start, walletType, assetSymbol } = this.props
      if (isReset) {
        start(walletType, assetSymbol)
      }
    }
  })
)(({
  walletType, assetSymbol, handleBack, continuePath, isConnected,
}) => (
  <div>
    <ModalBody className='py-4'>
      <ConnectionStatus />
      <ConnectionInstructions type={walletType} symbol={assetSymbol}/>
      <div className='my-3 w-50 mx-auto'>
        <DerivationPathChanger />
      </div>
    </ModalBody>
    <ModalFooter>
      <BackButton onClick={handleBack}>Back</BackButton>
      <Button tag={Link} to={continuePath} color='success' disabled={!isConnected}>Continue</Button>
    </ModalFooter>
  </div>
))

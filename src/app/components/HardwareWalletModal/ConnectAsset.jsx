import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers, lifecycle } from 'recompose'
import { Button, ModalBody, ModalFooter } from 'reactstrap'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-router-dom'
import { push } from 'react-router-redux'

import routes from 'Routes'
import { isStatusConnected, getDerivationPath, isStatusReset } from 'Selectors/connectHardwareWallet'
import {
  startConnect, retryConnect, cancelConnect, changeDerivationPath,
} from 'Actions/connectHardwareWallet'

import DerivationPathChanger from 'Components/DerivationPathChanger'

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
    derivationPath: getDerivationPath,
    isConnected: isStatusConnected,
    isReset: isStatusReset
  }), {
    start: startConnect,
    retry: retryConnect,
    changeDerivationPath,
    routerPush: push,
    handleBack: cancelConnect,
  }),
  withProps(({ walletType, assetSymbol }) => ({
    continuePath: routes.connectHwWalletAssetConfirm(walletType, assetSymbol),
  })),
  withHandlers({
    handleChangeDerivationPath: ({ derivationPath, changeDerivationPath, retry }) => (path) => {
      if (derivationPath !== path) {
        changeDerivationPath(path)
        retry()
      }
    },
  }),
  lifecycle({
    componentWillMount() {
      const { isReset, start, walletType, assetSymbol } = this.props
      if (isReset) {
        start(walletType, assetSymbol)
      }
    }
  })
)(({
  walletType, assetSymbol, handleBack, continuePath, isConnected, derivationPath, handleChangeDerivationPath,
}) => (
  <div>
    <ModalBody className='py-4'>
      <ConnectionStatus />
      <ConnectionInstructions type={walletType} symbol={assetSymbol}/>
      <div className='my-3 w-50 mx-auto'>
        <DerivationPathChanger onChange={handleChangeDerivationPath} path={derivationPath}/>
      </div>
    </ModalBody>
    <ModalFooter>
      <BackButton onClick={handleBack}>Back</BackButton>
      <Button tag={Link} to={continuePath} color='success' disabled={!isConnected}>Continue</Button>
    </ModalFooter>
  </div>
))

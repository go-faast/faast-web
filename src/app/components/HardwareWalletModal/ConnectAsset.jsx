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
import { isStatusConnected, isStatusReset, getDerivationPath } from 'Selectors/connectHardwareWallet'
import {
  startConnect, retryConnect, cancelConnect, changeDerivationPath,
} from 'Actions/connectHardwareWallet'
import conditionalRedirect from 'Hoc/conditionalRedirect'

import T from 'Components/i18n/T'

import Config from 'Config'

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
    asset: (state, { assetSymbol }) => getAsset(state, assetSymbol),
    derivationPath: getDerivationPath
  }), {
    start: startConnect,
    retry: retryConnect,
    routerPush: push,
    handleBack: cancelConnect,
    changeDerivationPath
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
  walletType, assetSymbol, asset, handleBack, continuePath, isConnected, changeDerivationPath, derivationPath
}) => {
  const legacyPath = Config.walletTypes.ledger.supportedAssets.ETH.legacy
  const isLegacy = derivationPath == legacyPath
  const defaultPath = Config.walletTypes.ledger.supportedAssets.ETH.derivationPath
  return (
    <div>
      <ModalBody className='py-4'>
        <ConnectionStatus />
        <ConnectionInstructions type={walletType} asset={asset}/>
        <div className='my-3 w-50 mx-auto'>
          <div className='mb-3'>
            <SwitchPathButton walletType={walletType} assetSymbol={assetSymbol}/>
          </div>
          {walletType == 'ledger' && assetSymbol == 'ETH' ? (
            <Button color='primary' className='mx-auto mb-2' onClick={() => changeDerivationPath(isLegacy ? defaultPath : legacyPath)}>
              <T tag='span' i18nKey='app.hardwareWalletModal.derivationPath.legacy'>
                {isLegacy ? 'Use default derivation path' : 'Use Legacy ETH Derivation Path'}
              </T>
            </Button>
          ) : null} 
          <DerivationPathChanger />
        </div>
      </ModalBody>
      <ModalFooter>
        <BackButton onClick={handleBack}>
          <T tag='span' i18nKey='app.hardwareWalletModal.connectAsset.back'>Back</T>
        </BackButton>
        <Button tag={Link} to={continuePath} color='success' disabled={!isConnected}>
          <T tag='span' i18nKey='app.hardwareWalletModal.connectAsset.continue'>Continue</T>
        </Button>
      </ModalFooter>
    </div>
  )
})

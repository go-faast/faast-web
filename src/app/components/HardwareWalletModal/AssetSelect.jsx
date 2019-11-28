/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, ModalBody, ModalFooter } from 'reactstrap'
import { difference } from 'lodash'

import { getConnectedAccountSymbols } from 'Selectors/connectHardwareWallet'
import { removeConnectedAccount, startConnectBatch, saveConnectedAccounts } from 'Actions/connectHardwareWallet'

import BackButton from './BackButton'
import ConnectAssetButton from './ConnectAssetButton'
import T from 'Components/i18n/T'
import WalletSelectorList from 'Components/WalletSelectorList'

import config from 'Config'

const ADD_ALL_TEXT = <T tag='span' i18nKey='app.hardwareWalletModal.assetSelect.addAll'>Add All Currencies</T>

export default compose(
  setDisplayName('AssetSelect'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    onCancel: PropTypes.func.isRequired,
    assetSymbols: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
  connect(createStructuredSelector({
    connectedAccountSymbols: getConnectedAccountSymbols,
  }), {
    removeAccount: removeConnectedAccount,
    startBatch: startConnectBatch,
    handleDone: saveConnectedAccounts
  }),
  withProps(({ assetSymbols, connectedAccountSymbols }) => ({
    isDoneDisabled: connectedAccountSymbols.length === 0,
    isConnectAllDisabled: difference(assetSymbols, connectedAccountSymbols).length === 0,
  })),
  withHandlers({
    handleCancel: ({ onCancel, connectedAccountSymbols, removeAccount }) => () => {
      connectedAccountSymbols.map(removeAccount)
      onCancel()
    },
    handleConnectAll: ({ walletType, assetSymbols, connectedAccountSymbols, startBatch }) => () => {
      startBatch(walletType, difference(assetSymbols, connectedAccountSymbols))
    }
  })
)(({ walletType, assetSymbols, handleCancel, handleDone, handleConnectAll, isConnectAllDisabled, isDoneDisabled }) => (
  <div>
    <ModalBody className='py-4'>
      <Row className='gutter-3'>
        {/* {assetSymbols.map((assetSymbol) => (
          <Col key={assetSymbol} xs='12'>
            <ConnectAssetButton walletType={walletType} assetSymbol={assetSymbol}/>
          </Col>
        ))} */}
        <T tag='span' i18nKey='app.hardwareWalletModal.assetSelect.addSpecificAsset' className='my-1 mx-auto'>Add a specific account by choosing one of the following supported currencies:</T>
        <Col>
          <WalletSelectorList walletType={walletType} supportedAssetSymbols={assetSymbols} />
        </Col>
      </Row>
      {/* <T tag='h5' i18nKey='app.hardwareWalletModal.assetSelect.express' className='mt-3 text-left'>For an express setup click '{ADD_ALL_TEXT}'</T> */}
      <Button color='primary' size='md' className='text-center mt-4' disabled={isConnectAllDisabled} onClick={handleConnectAll}>
        {ADD_ALL_TEXT}
      </Button>
      <p style={{ fontSize: '14px' }} className='mt-3 mb-0 text-left'>
        <a href={config.walletTypes[walletType].website}><i className='fa fa-info-circle'></i> <T tag='span' i18nKey='app.hardwareWalletModal.assetSelect.learnMore'></T> {walletType}</a>
      </p>
    </ModalBody>
    <ModalFooter>
      <BackButton onClick={handleCancel}>
        <T tag='span' i18nKey='app.hardwareWalletModal.assetSelect.cancel'>Cancel</T>
      </BackButton>
      <Button color='success' onClick={handleDone} disabled={isDoneDisabled}>
        <T tag='span' i18nKey='app.hardwareWalletModal.assetSelect.done'>Done</T>
      </Button>
    </ModalFooter>
  </div>
))

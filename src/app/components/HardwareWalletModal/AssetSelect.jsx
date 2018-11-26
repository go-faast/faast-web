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

import config from 'Config'

const ADD_ALL_TEXT = 'Add All Currencies'

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
      <h5 className='mb-3'>{`For an express setup click "${ADD_ALL_TEXT}"`}</h5>
      <Button color='primary' size='lg' className='text-center' disabled={isConnectAllDisabled} onClick={handleConnectAll}>
        {ADD_ALL_TEXT}
      </Button>
      <h5 className='mt-4 mb-3'>Or, add a specific account by choosing one of the following supported currencies.</h5>
      <Row className='gutter-3 justify-content-center'>
        {assetSymbols.map((assetSymbol) => (
          <Col key={assetSymbol} xs='6' md='4' lg='3'>
            <ConnectAssetButton walletType={walletType} assetSymbol={assetSymbol}/>
          </Col>
        ))}
      </Row>
      <p style={{ fontSize: '14px' }} className='mt-5 mb-0 text-left'>
        <a href={config.walletTypes[walletType].website}><i className='fa fa-info-circle'></i> Learn more about {walletType}</a>
      </p>
    </ModalBody>
    <ModalFooter>
      <BackButton onClick={handleCancel}>Cancel</BackButton>
      <Button color='success' onClick={handleDone} disabled={isDoneDisabled}>Done</Button>
    </ModalFooter>
  </div>
))

import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Button, Row, Col } from 'reactstrap'
import classNames from 'class-names'

import { removeConnectedAccount, startConnect } from 'Actions/connectHardwareWallet'
import { getConnectedAccountIds } from 'Selectors/connectHardwareWallet'
import { getAsset } from 'Selectors'

import CoinIcon from 'Components/CoinIcon'

export default compose(
  setDisplayName('ConnectAssetButton'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    assetSymbol: PropTypes.string.isRequired,
  }),
  connect(createStructuredSelector({
    connectedAccountIds: getConnectedAccountIds,
    asset: (state, { assetSymbol }) => getAsset(state, assetSymbol)
  }), {
    removeAccount: removeConnectedAccount,
    startConnect,
  }),
  withProps(({ connectedAccountIds, assetSymbol }) => ({
    isConnected: Boolean(connectedAccountIds[assetSymbol])
  })),
  withHandlers({
    handleClick: ({ startConnect, walletType, assetSymbol }) => () => startConnect(walletType, assetSymbol),
    handleRemove: ({ removeAccount, assetSymbol }) => () => removeAccount(assetSymbol)
  })
)(({ asset, isConnected, handleClick, handleRemove }) => (
  <Row className='justify-content-center gutter-2'>
    <Col xs='12'>
      <Button
        onClick={handleClick}
        color='ultra-dark' disabled={isConnected} size='lg'
        className={classNames('text-center w-100 lh-0', isConnected ? 'border-success' : 'border-primary')}>
        {isConnected && (
          <i className='text-success fa fa-check-circle' style={{ position: 'absolute', top: 0, right: 0 }}/>
        )}
        <CoinIcon symbol={asset.symbol} size='lg' inline/>
        <h5 className='mb-0 mt-3'>{asset.name}</h5>
      </Button>
    </Col>
    <Col xs='auto'>
      <Button color='danger' size='sm' disabled={!isConnected} onClick={handleRemove}>
        <i className='fa fa-times'/>
      </Button>
    </Col>
    <Col xs='auto'>
      <Button color='primary' size='sm' disabled={isConnected} onClick={handleClick}>
        <i className='fa fa-plus'/>
      </Button>
    </Col>
  </Row>
))

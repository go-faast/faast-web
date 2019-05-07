import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, Card, CardBody, CardFooter, Alert, ModalBody, ModalFooter } from 'reactstrap'
import { Link } from 'react-router-dom'

import routes from 'Routes'

import {
  getSelectedAccount, isAccountSelectEnabled,
} from 'Selectors/connectHardwareWallet'
import { confirmAccountSelection } from 'Actions/connectHardwareWallet'

import UnitsLoading from 'Components/UnitsLoading'
import AddressLink from 'Components/AddressLink'
import T from 'Components/i18n/T'

import BackButton from './BackButton'
import ConnectionStatus from './ConnectionStatus'
import redirectNotConnected from './redirectNotConnected'
import SwitchPathButton from './SwitchPathButton'
import DerivationPathChanger from './DerivationPathChanger'

export default compose(
  setDisplayName('ConfirmAccountSelection'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    assetSymbol: PropTypes.string.isRequired,
  }),
  redirectNotConnected,
  connect(createStructuredSelector({
    account: getSelectedAccount,
    accountSelectEnabled: isAccountSelectEnabled,
  }), {
    handleConfirm: confirmAccountSelection,
  }),
  withProps(({ walletType, assetSymbol, account }) => ({
    disableConfirm: !account.label,
    backPath: routes.connectHwWalletAsset(walletType, assetSymbol),
  }))
)(({
  account: { index, label, address, balance, error },
  walletType, assetSymbol, accountSelectEnabled, backPath, handleConfirm, disableConfirm,
}) => (
  <div>
    <ModalBody className='py-4'>
      <ConnectionStatus />
      <h5 className='mb-3'>{'Please confirm that you\'d like to add the following account.'}</h5>
      <Row className='gutter-3 justify-content-center'>
        <Col xs='auto'>
          <Card color='ultra-dark' className='text-left flat mb-4'>
            <CardBody>
              <h5 className='m-0'>
                <span className='font-weight-bold'>{address ? `Account #${index + 1}` : label}</span>
                <span className='float-right ml-5'>
                  <UnitsLoading value={balance} symbol={assetSymbol} error={error} showFiat/>
                </span>
              </h5>
              {address && (<AddressLink address={address} className='d-block mt-2 text-muted'/>)}
            </CardBody>
            {error && (
              <CardFooter tag={Alert} color='danger' className='font-size-xs m-0'>
                {error}
              </CardFooter>
            )}
          </Card>
        </Col>
        <div className='w-100'/>
        {accountSelectEnabled && (
          <Col xs='auto'>
            <Button tag={Link} to={routes.connectHwWalletAssetAccounts(walletType, assetSymbol)} color='primary'>
              <T tag='span' i18nKey='app.hardwareWalletModal.confirmAccount.changeAccount'>Change account</T>
            </Button>
          </Col>
        )}
        <div className='w-100'/>
        <Col xs='auto'>
          <SwitchPathButton walletType={walletType} assetSymbol={assetSymbol}/>
        </Col>
        <div className='w-100'/>
        <Col xs='auto'>
          <DerivationPathChanger />
        </Col>
      </Row>
    </ModalBody>
    <ModalFooter>
      <BackButton tag={Link} to={backPath}>
        <T tag='span' i18nKey='app.hardwareWalletModal.confirmAccount.back'>Back</T>
      </BackButton>
      <Button color='success' onClick={handleConfirm} disabled={disableConfirm}>
        <T tag='span' i18nKey='app.hardwareWalletModal.confirmAccount.confirm'>Confirm</T>
      </Button>
    </ModalFooter>
  </div>
))

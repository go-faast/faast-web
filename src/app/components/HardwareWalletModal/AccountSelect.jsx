/* eslint-disable react/no-unescaped-entities */
import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, lifecycle, withProps, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Button, ListGroup, ModalBody, ModalFooter } from 'reactstrap'
import { isUndefined } from 'lodash'
import { push } from 'react-router-redux'
import { Link } from 'react-router-dom'
import T from 'Components/i18n/T'

import routes from 'Routes'
import {
  changeAccountPage, changeAccountIndex, loadCurrentAccountPage,
} from 'Actions/connectHardwareWallet'

import {
  getSelectedPageAccounts, getSelectedPageIndex, getAccountPageStartIndex, getAccountPageEndIndex, 
} from 'Selectors/connectHardwareWallet'

import Units from 'Components/Units'
import Spinner from 'Components/Spinner'
import ListGroupButton from 'Components/ListGroupButton'

import BackButton from './BackButton'
import ConnectionStatus from './ConnectionStatus'
import redirectNotConnected from './redirectNotConnected'

export default compose(
  setDisplayName('AccountSelect'),
  setPropTypes({
    walletType: PropTypes.string.isRequired,
    assetSymbol: PropTypes.string.isRequired,
  }),
  redirectNotConnected,
  connect(createStructuredSelector({
    accounts: getSelectedPageAccounts,
    page: getSelectedPageIndex,
    startIndex: getAccountPageStartIndex,
    endIndex: getAccountPageEndIndex,
  }), {
    changePage: changeAccountPage,
    changeIndex: changeAccountIndex,
    loadCurrentAccountPage,
    routerPush: push,
  }),
  withProps(({ walletType, assetSymbol }) => ({
    backPath: routes.connectHwWalletAssetConfirm(walletType, assetSymbol),
  })),
  withHandlers({
    selectIndex: ({ changeIndex, routerPush, backPath }) => (index) => {
      changeIndex(index)
      routerPush(backPath)
    }
  }),
  lifecycle({
    componentWillMount() {
      this.props.loadCurrentAccountPage()
    }
  })
)(({
  startIndex, endIndex, accounts, page, selectIndex, changePage, backPath,
}) => (
  <div>
    <ModalBody className='py-4'>
      <ConnectionStatus />
      <T tag='h5' i18nKey='app.hardwareWalletModal.accountSelect.heading' className='mb-3'>Please select the account you'd like to add.</T>
      <ListGroup>
        {accounts.map(({ index, address, balance }) => (
          <ListGroupButton key={index} className='px-3' onClick={() => selectIndex(index)} disabled={isUndefined(address)}>
            <Row className='gutter-3 align-items-center'>
              <Col xs='1' className='text-primary'>#{index + 1}</Col>
              <Col className='text-left'>
                {!isUndefined(address)
                  ? address
                  : (<Spinner size='sm' inline/>)}
              </Col>
              <Col xs='auto' className='ml-auto'>
                {!isUndefined(balance)
                  ? (<Units value={balance} symbol='ETH'/>)
                  : (<Spinner size='sm' inline/>)}
              </Col>
            </Row>
          </ListGroupButton>
        ))}
      </ListGroup>
      <Row className='gutter-2 justify-content-between align-items-center'>
        <Col xs='3' className='text-left'>
          <Button color='link' onClick={() => changePage(page - 1)} disabled={page <= 0}><i className='fa fa-long-arrow-left'/> previous</Button>
        </Col>
        <Col className='text-muted'>
          <T tag='span' i18nKey='app.hardwareWalletModal.accountSelect.showAccounts'>showing accounts</T> {startIndex + 1} - {endIndex + 1}
        </Col>
        <Col xs='3' className='text-right'>
          <Button color='link' onClick={() => changePage(page + 1)}>
            <T tag='span' i18nKey='app.hardwareWalletModal.accountSelect.next'>next</T> <i className='fa fa-long-arrow-right'/>
          </Button>
        </Col>
      </Row>
    </ModalBody>
    <ModalFooter>
      <BackButton tag={Link} to={backPath}>
        <T tag='span' i18nKey='app.hardwareWalletModal.accountSelect.back'>Back</T>
      </BackButton>
    </ModalFooter>
  </div>
))

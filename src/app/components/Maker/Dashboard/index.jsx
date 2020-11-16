import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, CardDeck } from 'reactstrap'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import QRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import AffiliateLayout from 'Components/Maker/Layout'
import SwapsTable from 'Components/Maker/SwapsTable'
import BalancesTable from 'Components/Maker/BalanceTable'
// import StatsChart from './statsChart'
import Units from 'Components/Units'
import Loading from 'Components/Loading'

import { getStats } from 'Actions/maker'
import classNames from 'class-names'

import { makerId, getMakerProfile, getMakerProfit } from 'Selectors/maker'

import { statContainer, row, statCol } from './style'
import { card, cardHeader, text, smallCard, input } from '../style'

const MakerDashboard = ({ profile, makerProfit }) => {
  return (
    <Fragment>
      <AffiliateLayout className='pt-3'>
        <Fragment>
          <Row className={classNames(row, statContainer, 'text-center mt-3')}>
            <Col className={classNames('mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Total Balance (BTC)</p>
                <p className='pt-0 mb-0'>{profile.approxTotalBalances.total.BTC}</p>
              </div>
            </Col>
            <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Swaps Completed</p>
                <p className='pt-0 mb-0'>{profile.swapsCompleted}</p>
              </div>
            </Col>
            <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Capacity Amount (BTC)</p>
                <p className='pt-0 mb-0'>{profile.capacityMaximumBtc}</p>
              </div>
            </Col>
          </Row>
          <Row className='mt-4'>
            <CardDeck style={{ flex: 1 }}>
              <SwapsTable size='small'/>
              <Card className={classNames(card, smallCard)}>
                <CardHeader className={cardHeader}>Profit to Date</CardHeader>
                <CardBody className='text-center'>
                  {makerProfit ? (
                    <Fragment>
                      <p className='mb-0' style={{ fontSize: 70 }}>🎉</p>
                      <Units value={makerProfit} symbol='BTC' precision={6} style={{ fontSize: 50 }} className={classNames('font-weight-bold mt-0 mb-4 d-block', text)} />
                    </Fragment>
                  ) : (
                    <Loading />
                  )}
                 
                </CardBody>
              </Card>
            </CardDeck>
          </Row>
          <Row className='mt-4'>
            <CardDeck style={{ flex: 1 }}>
              <BalancesTable size='small' />
              <Card className={classNames(card, smallCard)}>
                <CardHeader className={cardHeader}>Capacity Wallet</CardHeader>
                <CardBody className='text-center'>
                  <QRCode address='bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' size={150} />
                  <p>Depositing BTC to this address will allow you to complete more swaps at a time.</p>
                  <ClipboardCopyField className={input} value='bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh' />
                </CardBody>
              </Card>
            </CardDeck>
          </Row>
        </Fragment>
      </AffiliateLayout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('MakerDashboard'),
  connect(createStructuredSelector({
    profile: getMakerProfile,
    makerId,
    makerProfit: getMakerProfit
  }), {
    getStats,
    push: push,
  }),
  lifecycle({
    componentDidMount() {
    }
  }),
)(MakerDashboard)

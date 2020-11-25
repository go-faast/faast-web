import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, CardDeck } from 'reactstrap'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { compose, setDisplayName, lifecycle } from 'recompose'
import QRCode from 'Components/DepositQRCode'
import ClipboardCopyField from 'Components/ClipboardCopyField'
import MakerLayout from 'Components/Maker/Layout'
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

const MakerDashboard = ({ profile: { capacityAddress, approxTotalBalances: { total: { BTC: balanceBTC = '-' } = {} } = {}, 
  swapsCompleted = '-', capacityMaximumBtc = '-' }, makerProfit }) => {
  return (
    <Fragment>
      <MakerLayout className='pt-3'>
        <Fragment>
          <Row className={classNames(row, statContainer, 'text-center mt-3')}>
            <Col className={classNames('mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Total Balance (BTC)</p>
                <p className='pt-0 mb-0'>{balanceBTC}</p>
              </div>
            </Col>
            <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Swaps Completed</p>
                <p className='pt-0 mb-0'>{swapsCompleted}</p>
              </div>
            </Col>
            <Col className={classNames('mt-xs-3 mt-md-0 mt-0', statCol)} sm='12' md='4'>
              <div className={classNames('mx-auto')}>
                <p className='text-center mb-0'>Capacity Amount (BTC)</p>
                <p className='pt-0 mb-0'>{capacityMaximumBtc}</p>
              </div>
            </Col>
          </Row>
          <Row className='mt-4'>
            <CardDeck style={{ flex: 1 }}>
              <SwapsTable title={'Recent Swaps'} size='small'/>
              <Card className={classNames(card, smallCard)}>
                <CardHeader className={cardHeader}>Profit to Date</CardHeader>
                <CardBody className='text-center'>
                  {makerProfit ? (
                    <Fragment>
                      <p className='mb-0' style={{ fontSize: 70 }}>🎉</p>
                      <span style={{ fontSize: 50 }} className={text}>{makerProfit > 0 && '+'}<Units value={makerProfit} symbol='BTC' precision={6} className={classNames('font-weight-bold mt-0 mb-4 d-inline-block', text)} /></span>
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
                  {capacityAddress ? (
                    <Fragment>
                      <QRCode address={capacityAddress} size={150} />
                      <p style={{ fontWeight: 600 }} className={classNames('text-left mb-0', text)}>Capacity Address:</p>
                      <ClipboardCopyField className={input} value={capacityAddress} />
                      <small className={classNames('text-left d-block', text)}>Depositing more BTC to your capacity address will increase the swap value your maker can process.</small>
                    </Fragment>
                  ) : (
                    <Loading />
                  )}
                </CardBody>
              </Card>
            </CardDeck>
          </Row>
        </Fragment>
      </MakerLayout>
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

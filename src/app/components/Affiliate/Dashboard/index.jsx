import React from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, Button, CardDeck } from 'reactstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName } from 'recompose'
import PieChart from './pieChart'
import AffiliateLayout from 'Components/Affiliate/Layout'
import SwapsTable from 'Components/Affiliate/SwapsTable'
import WithdrawalTable from 'Components/Affiliate/WithdrawalTable';
// import StatsChart from './statsChart'
import Units from 'Components/Units'

import { getStats } from 'Actions/affiliate'
import classNames from 'class-names'

import { affiliateStats, getAffiliateBalance } from 'Selectors'

import { stat1, stat2, stat3, row, withdrawal } from './style'
import { card, cardHeader, text, smallCard } from '../style'


const AffiliateDashboard = ({ stats: { swaps_completed = 0, value_btc = 0, affiliate_payouts_btc = 0 } = {}, 
  balance }) => {
  return (
    <AffiliateLayout className='pt-3'>
      {/* <StatsChart /> */}
      <Row className={classNames(row, 'text-center mt-3')}>
        <Col className='mt-0' sm='12' md='4'>
          <div className={classNames('mx-auto', stat1)}>
            <p className='pt-3'>{swaps_completed}</p>
            <p className='text-left pt-2 pl-3'>Swaps Completed</p>
          </div>
        </Col>
        <Col className='mt-md-0 mt-3' sm='12' md='4'>
          <div className={classNames('mx-auto', stat2)}>
            <p className='pt-3'>{value_btc}</p>
            <p className='text-left pt-2 pl-3'>BTC Value of Swaps</p>
          </div>
        </Col>
        <Col className='mt-md-0 mt-3' sm='12' md='4'>
          <div className={classNames('mx-auto', stat3)}>
            <p className='pt-3'>{affiliate_payouts_btc}</p>
            <p className='text-left pt-2 pl-3'>BTC Earned</p>
          </div>
        </Col>
      </Row>
      <Row className='mt-4'>
        <CardDeck style={{ flex: 1 }}>
          <SwapsTable size='small'/>
          <Card className={classNames(card, smallCard)}>
            <CardHeader className={cardHeader}>Earnings Ready for Payout</CardHeader>
            <CardBody className='text-center'>
              <p className='mb-0' style={{ fontSize: 70 }}>🎉</p>
              <Units value={balance} symbol='BTC' precision={6} style={{ fontSize: 50 }} className={classNames('font-weight-bold mt-0 mb-4 d-block', text)}/>
              <Button 
                tag={Link} 
                to='/affiliates/settings' 
                className={classNames(withdrawal, 'flat px-4 mb-3')} 
                color='primary'
                disabled={balance == 0}
              >
                Initiate a Withdrawal
              </Button>
            </CardBody>
          </Card>
        </CardDeck>
      </Row>
      <Row className='mt-4'>
        <CardDeck style={{ flex: 1 }}>
          <Card className={classNames(card, smallCard)}>
            <CardHeader className={cardHeader}>Distribution of Swaps</CardHeader>
            <CardBody>
              <PieChart/>
            </CardBody>
          </Card>
          <WithdrawalTable size='small'/>
        </CardDeck>
      </Row>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliateDashboard'),
  connect(createStructuredSelector({
    stats: affiliateStats,
    balance: getAffiliateBalance,
  }), {
    getStats,
  })
)(AffiliateDashboard)

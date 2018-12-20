import React from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody, Button, CardFooter, CardDeck } from 'reactstrap'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'
import PieChart from './pieChart'
import AffiliateLayout from 'Components/Affiliate/Layout'
import SwapsTable from 'Components/Affiliate/SwapsTable'
import WithdrawalTable from 'Components/Affiliate/WithdrawalTable';
import Units from 'Components/Units'

import { getStats } from 'Actions/affiliate'
import classNames from 'class-names'

import { affiliateStats, getAffiliateBalance } from 'Selectors'

import { stat1, stat2, stat3, row, withdrawal } from './style'
import { card, cardHeader, text, smallCard } from '../style'


const AffiliateDashboard = ({ stats: { swaps_completed, value_btc, affiliate_payouts_btc } = {}, 
  balance }) => {
  return (
    <AffiliateLayout className='pt-3'>
      <Row className={classNames(row, 'text-center mt-3')}>
        <Col>
          <div className={classNames('mx-auto', stat1)}>
            <p className='pt-3'>{swaps_completed}</p>
            <p className='text-left pt-2 pl-3'>Swaps Completed</p>
          </div>
        </Col>
        <Col>
          <div className={classNames('mx-auto', stat2)}>
            <p className='pt-3'>{value_btc}</p>
            <p className='text-left pt-2 pl-3'>BTC Value of Swaps</p>
          </div>
        </Col>
        <Col>
          <div className={classNames('mx-auto', stat3)}>
            <p className='pt-3'>{affiliate_payouts_btc}</p>
            <p className='text-left pt-2 pl-3'>BTC Earned</p>
          </div>
        </Col>
      </Row>
      <Row className='mt-4'>
        <CardDeck style={{ flex: 1 }}>
          <SwapsTable size='small'/>
          <Card className={card}>
            <CardHeader className={cardHeader}>Funds Ready for Payout</CardHeader>
            <CardBody className='text-center'>
              <p className='mb-0' style={{ fontSize: 70 }}>🎉</p>
              <Units value={balance} symbol='BTC' precision={6} style={{ fontSize: 50 }} className={classNames('font-weight-bold mt-0 mb-4 d-block', text)}/>
              <Button tag={Link} to='/affiliates/settings' className={classNames(withdrawal, 'flat px-4 mb-3')} color='primary'>Initiate a Withdrawal</Button>
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
  }),
  setPropTypes({
  }),
  defaultProps({
  }),
  withHandlers({
  }),
  // lifecycle({
  //   componentWillMount() {
  //     const { getStats } = this.props
  //     getStats('DLABdEEmJUcLfLs2Y7jkkZntvdENT3nL', '1a585fe709b35047900b450040ff6d3771b3')
  //   }
  // })
)(AffiliateDashboard)

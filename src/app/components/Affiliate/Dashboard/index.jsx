import React from 'react'
import { createStructuredSelector } from 'reselect'
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap'
import { connect } from 'react-redux'
import { compose, setDisplayName, setPropTypes, lifecycle, defaultProps, withHandlers, withState } from 'recompose'
import PropTypes from 'prop-types'
import PieChart from './pieChart'
import AffiliateLayout from 'Components/Affiliate/Layout'
import { getStats } from 'Actions/affiliate'
import classNames from 'class-names'

import { affiliateStats } from 'Selectors'

import { stat1, stat2, stat3, row } from './style'
import { card, cardHeader } from '../style'

const AffiliateDashboard = ({ stats: { swaps_completed, value_btc, affiliate_payouts_btc } = {} }) => {
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
        <Col>
          <Card className={card}>
            <CardHeader className={cardHeader}>Distribution of Swaps</CardHeader>
            <CardBody>
              <PieChart/>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </AffiliateLayout>
  )
}

export default compose(
  setDisplayName('AffiliateDashboard'),
  connect(createStructuredSelector({
    stats: affiliateStats
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

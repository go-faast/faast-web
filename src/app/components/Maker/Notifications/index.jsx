import React from 'react'
import { compose, setDisplayName } from 'recompose'
import MakerLayout from 'Components/Maker/Layout'
import NotificationsTable from 'Components/Maker/NotificationsTable'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import Link from 'Components/Link'
import { statContainer } from '../Dashboard/style'
import classNames from 'class-names'

import { getMakerBalanceAlertsCount } from 'Selectors/maker'

const Notifications = ({ balanceAlertCount }) => {
  balanceAlertCount = 3
  return (
    <MakerLayout className='pt-4'>
      {balanceAlertCount > 0 ? (
        <Row className={classNames(statContainer, 'mt-2 mb-4 p-3 text-center')}>
          <Col xs='12'>
            <Link to='/makers/balances' className='text-white'>You have coins that do not meet the minimum balance required to fulfill trades. Click here for more info.</Link>
          </Col>
        </Row>
      ) : null}
      
      <NotificationsTable />
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('Notifications'),
  connect(createStructuredSelector({
    balanceAlertCount: getMakerBalanceAlertsCount,
  }), {
  }),
)(Notifications)

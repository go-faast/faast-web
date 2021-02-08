import React from 'react'
import { compose, setDisplayName } from 'recompose'
import MakerLayout from 'Components/Maker/Layout'
import NotificationsTable from 'Components/Maker/NotificationsTable'
import { Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import classNames from 'class-names'

import { row, statContainer } from '../Dashboard/style'
import { minLink } from './style'

import { getNotificationCount } from 'Selectors/maker'

const Notifications = ({ notificationCount }) => {
  return (
    <MakerLayout className='pt-4'>
      {notificationCount > 0 ? (
        <Row 
          tag='a' 
          href='https://app.gitbook.com/@faast/s/faast/market-maker-setup/maker-minimum-balances' 
          target='_blank noreferrer'
          className={classNames(row, statContainer, minLink, 'text-center mt-2 mb-3 py-2')}
        >
          <Col>If you have any questions about these alerts check out this article about minimums.</Col>
        </Row>
      ) : null}
      <NotificationsTable />
    </MakerLayout>
  )
}

export default compose(
  setDisplayName('Notifications'),
  connect(createStructuredSelector({
    notificationCount: getNotificationCount,
  }), {
  }),
)(Notifications)

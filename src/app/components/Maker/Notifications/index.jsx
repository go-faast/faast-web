import React from 'react'
import { compose, setDisplayName } from 'recompose'
import MakerLayout from 'Components/Maker/Layout'
import NotificationsTable from 'Components/Maker/NotificationsTable'
import { Row, Col } from 'reactstrap'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import classNames from 'class-names'

import { row, statContainer } from '../Dashboard/style'

import { getNotificationCount } from 'Selectors/maker'

const Notifications = ({ notificationCount }) => {
  return (
    <MakerLayout className='pt-4'>
      {notificationCount > 0 ? (
        <Row className={classNames(row, statContainer, 'text-center mt-2 mb-3 py-2')}>
          <Col>If you have any questions about these alerts shoot us an email at support@faa.st</Col>
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

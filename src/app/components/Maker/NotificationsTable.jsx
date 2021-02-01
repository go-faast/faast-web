import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, } from 'recompose'
import { Row, Col, Card, CardHeader, CardBody } from 'reactstrap'
import classNames from 'class-names'

import { getMakerWarnings } from 'Selectors/maker'

import { text, card, cardHeader } from './style'

const WarningRow = ({
  warning,
  hr,
  ...props
}) => {
  return (
    <Col xs='12' {...props}>
      <p className={classNames(text, 'pl-4')}><i className='fa fa-exclamation-circle text-warning mr-3' />{warning}</p>
      {hr && <hr className='w-100 border-light'/>}
    </Col>
  )
}

const NotificationsTable = ({ warnings }) => {
  return (
    <Fragment>
      <Card className={classNames(card, 'mx-auto')}>
        <CardHeader className={cardHeader}>Alerts</CardHeader>
        <CardBody className={classNames(warnings.length > 0 ? 'p-0' : 'text-center')}>
          {warnings.length > 0 ? (
            <Row className='pt-3'>
              {warnings.map((warning, i) => {
                return (
                  <WarningRow key={i}  warning={warning} hr={i !== warnings.length - 1}/>
                )
              })}
            </Row>
          ) :
            <div className='d-flex align-items-center justify-content-center'>
              <p className={classNames('mb-0', text)}>No notifications right now.</p>
            </div>
          }
        </CardBody>
      </Card>
    </Fragment>
  )
}

export default compose(
  setDisplayName('NotificationsTable'),
  connect(createStructuredSelector({
    warnings: getMakerWarnings,
  }), {
  }),
  withRouter,
)(NotificationsTable)

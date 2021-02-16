import React, { Fragment } from 'react'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { compose, setDisplayName, } from 'recompose'
import { Row, Col, Card, CardHeader, CardBody, Button } from 'reactstrap'
import classNames from 'class-names'
import Link from 'Components/Link'

import { getMakerWarnings, getBalanceAlerts } from 'Selectors/maker'

import { text, card, cardHeader } from './style'

const WarningRow = ({
  warning,
  hr,
  ...props
}) => {
  return (
    <Col xs='12' {...props}>
      <p className={classNames(text, 'pl-4')}><i className='fa fa-exclamation-circle text-danger mr-3' />{warning}</p>
      {hr && <hr className='w-100 border-light'/>}
    </Col>
  )
}

const BalanceAlertRow = ({
  warning: { alert, symbol, address },
  hr,
  ...props
}) => {
  return (
    <Fragment>
      <Col xs='10' {...props}>
        <p className={classNames(text, 'pl-4 mb-0 pb-0')}><i className='fa fa-exclamation-circle text-warning mr-3' />{alert}</p>
      </Col>
      <Col xs='2'>
        <Button tag={Link} color='primary' size='sm' className='flat' to={`/makers/alerts/deposit/${symbol}/${address}`}>Deposit {symbol}</Button>
      </Col>
      {hr && <hr className='w-100 border-light'/>}
    </Fragment>
  )
}

const NotificationsTable = ({ warnings, balanceAlerts }) => {
  return (
    <Fragment>
      <Card className={classNames(card, 'mx-auto mb-4')}>
        <CardHeader className={cardHeader}>General Alerts</CardHeader>
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
              <p className={classNames('mb-0', text)}>No alerts right now.</p>
            </div>
          }
        </CardBody>
      </Card>
      <Card className={classNames(card, 'mx-auto')}>
        <CardHeader className={cardHeader}>Balance Alerts</CardHeader>
        <CardBody className={classNames(balanceAlerts.length > 0 ? 'p-0' : 'text-center')}>
          {balanceAlerts.length > 0 ? (
            <Row className='py-3 align-items-center'>
              {balanceAlerts.map((warning, i) => {
                return (
                  <BalanceAlertRow key={i} warning={warning} hr={i !== balanceAlerts.length - 1}/>
                )
              })}
            </Row>
          ) :
            <div className='d-flex align-items-center justify-content-center'>
              <p className={classNames('mb-0', text)}>You have the minimum required balances for all supported assets.</p>
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
    balanceAlerts: getBalanceAlerts
  }), {
  }),
  withRouter,
)(NotificationsTable)

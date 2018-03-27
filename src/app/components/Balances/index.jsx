import React from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col, Card, CardHeader, CardBody
} from 'reactstrap'
import classNames from 'class-names'
import { connect } from 'react-redux'

import display from 'Utilities/display'
import { getWalletWithHoldings } from 'Selectors'

import Address from 'Components/Address'
import ChangePercent from 'Components/ChangePercent'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import PieChart from 'Components/PieChart'
import AssetTable from 'Components/AssetTable'

import { statLabel } from './style'

const Balances = ({ wallet }) => {
  const {
    address, assetHoldings,
    totalFiat, totalFiat24hAgo, totalChange, balancesLoaded, balancesError
  } = wallet

  const assetRows = assetHoldings.filter(({ shown }) => shown)
  const stats = [
    {
      title: 'total assets',
      value: assetRows.length,
      colClass: 'order-2 order-lg-1'
    },
    {
      title: 'total balance',
      value: display.fiat(totalFiat),
      colClass: 'order-1 order-lg-2'
    },
    {
      title: 'balance 24h ago',
      value: display.fiat(totalFiat24hAgo),
      colClass: 'order-3'
    },
    {
      title: 'since 24h ago',
      value: (<ChangePercent>{totalChange}</ChangePercent>),
      colClass: 'order-4'
    },
  ]

  return (
    <Card>
      {!balancesLoaded && (<LoadingFullscreen center error={balancesError}/>)}
      <CardHeader className='grid-group'>
        <Row className='gutter-3'>
          {stats.map(({ title, value, colClass }, i) => (
            <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
              <div className='grid-cell'>
                <div className='h3 mb-0'>{value}</div>
                <small className={classNames('mb-0', statLabel)}>{title}</small>
              </div>
            </Col>
          ))}
        </Row>
      </CardHeader>
      <CardBody>
        {address && (
          <div className='text-right' style={{ lineHeight: 1 }}>
            <Address address={address} />
            <small className='text-muted'>address</small>
          </div>
        )}
        <PieChart portfolio={wallet} />
      </CardBody>
      <AssetTable assetRows={assetRows}/>
    </Card>
  )
}

Balances.propTypes = {
  wallet: PropTypes.object.isRequired
}

const ConnectedBalances = connect((state, { id }) => ({
  wallet: getWalletWithHoldings(state, id)
}))(Balances)

ConnectedBalances.propTypes = {
  id: PropTypes.string.isRequired,
}

Balances.Connected = ConnectedBalances

export { Balances, ConnectedBalances }
export default Balances
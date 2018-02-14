import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import BigNumber from 'bignumber.js'
import classNames from 'class-names'
import Layout from 'Components/Layout'
import Address from 'Components/Address'
import PriceChart from 'Components/PriceChart'
import SignTxModal from 'Components/SignTxModal'
import Welcome from 'Components/Welcome'
import display from 'Utilities/display'
import styles from './style'
import config from 'Config'
import { breakpointNext } from 'Utilities/breakpoints'
import { Row, Col, Card, CardBody, CardHeader, Table } from 'reactstrap'
import WalletSelector from 'Components/WalletSelector'
import LoadingFullscreen from 'Components/LoadingFullscreen'

const { collapseTablePoint } = styles
const expandTablePoint = breakpointNext(collapseTablePoint)

const OrderInProgress = (props) => {
  const statusIcon = () => {
    switch (props.status) {
    case 'working':
      return <div className='faast-loading loading-medium margin-top-30 margin-left-10' />
    case 'complete':
      return <div className='margin-top-30 margin-left-10' />
    case 'error':
      return <div className='margin-top-30 margin-left-10' />
    }
  }
  const statusTitle = () => {
    switch (props.status) {
    case 'working':
      return 'orders in progress'
    case 'complete':
      return 'orders complete'
    case 'error':
      return 'orders done with errors'
    }
  }
  const statusContent = () => {
    switch (props.status) {
    case 'working':
      return 'The orders placed with respect to your previous transaction is still in progress. You cannot modify your portfolio until your previous orders have been fulfilled.'
    case 'complete':
      return 'The orders have completed successfully. It may take a short amount of time to see the adjusted balances reflected in your portfolio.'
    case 'error':
      return 'There was an issue with one or more of your orders. Select "view status" for more details.'
    }
  }
  return (
    <Row className='no-gutters-x my-3'>
      <Col className='tile-container'>
        <div onClick={props.handleViewStatus} className='tile-new' style={{ zIndex: 10 }}>view status</div>
        <Row>
          <Col xs='12' md='3'>
            {statusIcon()}
          </Col>
          <Col xs='12' md='6'>
            <div className='text-medium text-gradient'>
              {statusTitle()}
            </div>
            <div className='text-small text-medium-grey'>
              {statusContent()}
            </div>
          </Col>
          <Col xs='12' md='3'>
            {props.status === 'working' &&
              <div className='row align-items-end' style={{ height: '100%' }}>
                <div className='col text-right text-x-small text-medium-grey'>
                  <span className='cursor-pointer' onClick={props.handleForgetOrder}>forget</span>
                </div>
              </div>
            }
          </Col>
        </Row>
      </Col>
    </Row>
  )
}

const TableCell = ({ heading, hideCollapse, className, children, ...extraProps }) => {
  const Tag = heading ? 'th' : 'td'
  return (
    <Tag {...extraProps} className={classNames(className, { [`d-none d-${expandTablePoint}-table-cell`]: hideCollapse })}>
      {children}
    </Tag>
  )
}

const ChangePercent = ({ children: change }) => <span className={change.isNegative() ? 'text-red' : 'text-green'}>{display.percentage(change, true)}</span>

const BalancesView = (props) => {
  const {
    totalChange, total24hAgo, total, assetRows, viewOnly, orderStatus, addressProps, pieChart,
    toggleChart, layoutProps, showOrderModal, handleToggleOrderModal, openCharts, balancesLoading, balancesError,
  } = props

  const values = [
    {
      title: '24h change',
      value: (<ChangePercent>{totalChange}</ChangePercent>)
    },
    {
      title: '24h ago (USD)',
      value: display.fiat(total24hAgo)
    },
    {
      title: 'current (USD)',
      value: display.fiat(total)
    },
    {
      title: 'total assets',
      value: assetRows.length
    }
  ]

  const renderAssets = () => {
    if (assetRows.length === 0) {
      return (
        <div className={`text-center ${styles.tableRow}`}>
          <i>No assets to show</i>
        </div>
      )
    }
    return assetRows.map((asset) => {
      const { symbol, name, fiat, balance, price, percentage, change24, infoUrl } = asset
      const displayName = name.length > 12 ? symbol : name
      const displayUnits = display.units(balance, symbol, price, false)
      const displayUnitsWithSymbol = display.units(balance, symbol, price, true)
      const displayWeight = display.percentage(percentage)
      const displayChange = (<ChangePercent>{change24}</ChangePercent>)
      const fiatValue = display.fiat(fiat)
      const fiatPrice = display.fiat(price)
      const chartOpen = openCharts[symbol]
      return (
        <tr key={symbol} onClick={() => toggleChart(symbol)} className={`${styles.tableRow} ${styles.tableRowAction}`}>
          <TableCell className={styles.tableCell}>
            <Row className='no-gutters'>
              <Col {...({ xs: '12', [expandTablePoint]: 'auto' })}>
                <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
              </Col>
              <Col {...({ xs: '12', [expandTablePoint]: 'auto' })} tag='p' className={`text-center text-${expandTablePoint}-left ${styles.tableCoinName}`}>{displayName}</Col>
            </Row>
            <Collapse isOpen={chartOpen}>
              <div className={styles.assetTitle}>
                <strong>{name}</strong> ({symbol})
                <span><i className='fa fa-external-link text-gradient margin-left-10' /> <a className={styles.link} href={infoUrl} target='_blank' rel='noopener'>info</a></span>
              </div>
              <PriceChart symbol={symbol} chartOpen={chartOpen} />
            </Collapse>
          </TableCell>
          <TableCell className={styles.tableCell}>
            <p>
              <span className={`d-none d-${expandTablePoint}-inline-block`}>{displayUnitsWithSymbol}</span>
              <span className={`d-${expandTablePoint}-none`}>{displayUnits}</span>
            </p>
            <p className={`d-${expandTablePoint}-none`}>{symbol}</p>
          </TableCell>
          <TableCell className={styles.tableCell}>
            <p>{fiatValue}</p>
            <p className={`d-${expandTablePoint}-none`}>{displayWeight}</p>
          </TableCell>
          <TableCell className={styles.tableCell} hideCollapse>
            {displayWeight}
          </TableCell>
          <TableCell className={styles.tableCell}>
            <p>{fiatPrice}</p>
            <p className={classNames(`d-${expandTablePoint}-none`)}>{displayChange}</p>
          </TableCell>
          <TableCell className={styles.tableCell} hideCollapse>
            <p className='float-right'>{displayChange}</p>
          </TableCell>
        </tr>
      )
    })
  }

  return (
    <Layout {...layoutProps}>
      {viewOnly &&
        <div className='col-12 my-3'>
          <div className={`text-center ${styles.viewMode}`}>
            You are in VIEW MODE. If this is your address, you will need to access the wallet before you can trade assets.
          </div>
        </div>
      }
      {!viewOnly &&
        <SignTxModal showModal={showOrderModal} toggleModal={handleToggleOrderModal} view='orderStatus' />
      }
      {!viewOnly &&
        <Welcome />
      }
      {!viewOnly && !!orderStatus &&
        <OrderInProgress status={orderStatus} handleViewStatus={handleToggleOrderModal} />
      }
      <Row className='medium-gutters'>
        <Col xs='12' md='6' lg='4'>
          <WalletSelector/>
        </Col>
        <Col xs='12' md='6' lg='8'>
          <Row className='medium-gutters'>
            {balancesLoading && (<LoadingFullscreen center error={balancesError}/>)}
            <Col xs='12'>
              <Card>
                <CardHeader>
                  <Row className='medium-gutters-y x-large-gutters-x'>
                    {values.map(({ title, value, valueClass }, i) => (
                      <Col xs='6' lg='3' key={i} className='text-center'>
                        <div className='text-medium-grey'>{title}</div>
                        <div className={classNames('text-medium', valueClass)}>{value}</div>
                      </Col>
                    ))}
                  </Row>
                </CardHeader>
                <CardBody>
                  {addressProps.address && (
                    <div className='text-right px-3' style={{ lineHeight: 1 }}>
                      <div className='text-medium-grey mb-1'>address</div>
                      <Address className={`${styles.link} ${styles.addressLink}`} {...addressProps} />
                    </div>
                  )}
                  {pieChart}
                </CardBody>
              </Card>
            </Col>
            <Col xs='12'>
              <Card>
                <Table>
                  <thead>
                    <tr>
                      <TableCell heading className={`text-center text-${expandTablePoint}-left`}>Asset</TableCell>
                      <TableCell heading className='text-right'>Units</TableCell>
                      <TableCell heading className='text-right'>Holdings</TableCell>
                      <TableCell heading hideCollapse className='text-right'>Weight</TableCell>
                      <TableCell heading className='text-right'>Price</TableCell>
                      <TableCell heading hideCollapse className='text-right'>24h change</TableCell>
                    </tr>
                  </thead>
                  <tbody>
                    {renderAssets()}
                  </tbody>
                </Table>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </Layout>
  )
}

BalancesView.propTypes = {
  totalChange: PropTypes.instanceOf(BigNumber),
  totalDecrease: PropTypes.bool,
  total24hAgo: PropTypes.instanceOf(BigNumber),
  total: PropTypes.instanceOf(BigNumber),
  assetRows: PropTypes.array,
  toggleChart: PropTypes.func,
  layoutProps: PropTypes.object,
  pieChart: PropTypes.element
}

export default BalancesView

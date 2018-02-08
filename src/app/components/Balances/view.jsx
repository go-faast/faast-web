import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import BigNumber from 'bignumber.js'
import Layout from 'Components/Layout'
import Address from 'Components/Address'
import PriceChart from 'Components/PriceChart'
import SignTxModal from 'Components/SignTxModal'
import Welcome from 'Components/Welcome'
import display from 'Utilities/display'
import styles from './style'
import config from 'Config'
import { breakpointNext } from 'Utilities/breakpoints'
import { Row, Col } from 'reactstrap'

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

const TableCell = ({ hideCollapse, className, children, ...extraProps }) => (
  <Col
    {...({ xs: '3', [expandTablePoint]: '2', ...extraProps })}
    className={`${hideCollapse ? `d-none d-${expandTablePoint}-block` : ''} ${className ? className : ''}`}>
    {children}
  </Col>
)

const BalancesView = (props) => {
  const {
    totalChange, totalDecrease, total24hAgo, total, assetRows, viewOnly, orderStatus, addressProps, pieChart,
    toggleChart, layoutProps, showOrderModal, handleToggleOrderModal, openCharts,
  } = props

  const values = [
    {
      title: '24h change',
      value: display.percentage(totalChange, true),
      changeIcon: totalDecrease ? styles.changeDownIcon : styles.changeUpIcon
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
      title: 'number of assets',
      value: assetRows.length
    }
  ]

  const renderAssets = () => {
    return assetRows.map((a, i) => {
      const { symbol, name, fiat, balance, price, percentage, change24, priceDecrease, infoUrl } = a
      const displayUnits = display.units(balance, symbol, price, false)
      const displayUnitsWithSymbol = display.units(balance, symbol, price, true)
      const displayWeight = display.percentage(percentage)
      const displayChange = display.percentage(change24, true)
      const fiatValue = display.fiat(fiat)
      const fiatPrice = display.fiat(price)
      const chartOpen = openCharts[symbol]
      return (
        <div key={i} onClick={() => toggleChart(symbol)} className={styles.tableRow}>
          <Row className='small-gutters-x'>
            <TableCell className={styles.tableCell}>
              <Row className='no-gutters'>
                <Col {...({ xs: '12', [expandTablePoint]: 'auto' })}>
                  <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
                </Col>
                <Col {...({ xs: '12', [expandTablePoint]: 'auto' })} tag='p' className={`text-center text-${expandTablePoint}-left ${styles.tableCoinName}`}>{name}</Col>
              </Row>
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
              <p className={`d-${expandTablePoint}-none ${priceDecrease ? styles.priceDecrease : styles.priceIncrease}`}>{displayChange}</p>
            </TableCell>
            <TableCell className={styles.tableCell} hideCollapse>
              <p className='float-right'>{displayChange}</p>
              <div className={priceDecrease ? styles.tableChangeDownIcon : styles.tableChangeUpIcon} />
            </TableCell>
          </Row>
          <Collapse isOpen={chartOpen}>
            <div className={styles.areaChartContainer}>
              <div className={styles.tileContainer}>
                <div className='row'>
                  <div className='col-8'>
                    <div className={styles.assetTitle}>
                      <strong>{name}</strong> ({symbol})
                      <span><i className='fa fa-external-link text-gradient margin-left-10' /> <a className={styles.link} href={infoUrl} target='_blank' rel='noopener'>info</a></span>
                    </div>
                  </div>
                  <div className='col-4 text-right'>
                    {/* <span className='link'>send</span> | <span className='link'>receive</span> */}
                  </div>
                </div>
                <PriceChart symbol={symbol} chartOpen={chartOpen} />
              </div>
            </div>
          </Collapse>
        </div>
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
      <div className={styles.statsContainer}>
        <div className='row small-gutters'>
          {values.map(({ title, value, changeIcon }, i) => (
            <div key={i} className='col-6 col-md-3'>
              <div className={styles.tileContainer}>
                <div className='row'>
                  {!!changeIcon &&
                    <div className='col-3'>
                      <div className={changeIcon} />
                    </div>
                  }
                  <div className={changeIcon ? 'col-9' : 'col'}>
                    <div className={styles.statsTitle}>{title}</div>
                    <div className={`text-white ${styles.statsContent}`}>{value}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className={`row ${styles.chartContainer}`}>
        <div className='col'>
          <div className={styles.tileContainer}>
            {addressProps.address && (
              <div style={{ textAlign: 'right' }}>
                <div className={styles.addressTitle}>address</div>
                <Address className={`${styles.link} ${styles.addressLink}`} {...addressProps} />
              </div>
            )}
            {pieChart}
          </div>
        </div>
      </div>

      <div className={styles.tableHeader}>
        <Row className='small-gutters-x'>
          <TableCell className={`${styles.columnTitle} text-center text-${expandTablePoint}-left`}>Asset</TableCell>
          <TableCell className={styles.columnTitle}>Units</TableCell>
          <TableCell className={styles.columnTitle}>Holdings</TableCell>
          <TableCell className={styles.columnTitle} hideCollapse>Portfolio Weight</TableCell>
          <TableCell className={styles.columnTitle}>Price</TableCell>
          <TableCell className={`${styles.columnTitle} text-right`} hideCollapse>24h change</TableCell>
        </Row>
      </div>
      <div className={styles.gradientSeparator} />
      {renderAssets()}
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

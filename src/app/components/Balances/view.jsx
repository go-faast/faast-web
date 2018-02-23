import React from 'react'
import PropTypes from 'prop-types'
import { Collapse } from 'reactstrap'
import BigNumber from 'bignumber.js'
import classNames from 'class-names'
import { Link } from 'react-router-dom'
import Layout from 'Components/Layout'
import Address from 'Components/Address'
import PriceChart from 'Components/PriceChart'
import SignTxModal from 'Components/SignTxModal'
import Welcome from 'Components/Welcome'
import Units from 'Components/Units'
import display from 'Utilities/display'
import styles from './style'
import config from 'Config'
import { breakpointNext } from 'Utilities/breakpoints'
import { Row, Col, Card, CardBody, CardHeader, Table, Button, Alert } from 'reactstrap'
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

const ChangePercent = ({ children: change }) => <span className={change.isNegative() ? 'text-red' : 'text-green'}>{display.percentage(change, true)}</span>

const BalancesView = (props) => {
  const {
    wallet, viewOnly, orderStatus, addressProps, pieChart,
    toggleChart, layoutProps, showOrderModal, handleToggleOrderModal,
    openCharts, disableModify, disableRemove, handleRemove, isDefaultPortfolioEmpty
  } = props

  const { label, type, totalFiat, totalFiat24hAgo, totalChange, balancesLoaded, balancesError } = wallet
  const isPortfolio = type === 'MultiWallet'
  const assetRows = wallet.assetHoldings.filter(({ shown }) => shown)
  const balancesLoading = !balancesLoaded

  const collapsedOnly = `d-${expandTablePoint}-none`
  const expandedOnlyBlock = `d-none d-${expandTablePoint}-block`
  const expandedOnlyCell = `d-none d-${expandTablePoint}-table-cell`

  const stats = [
    {
      title: 'total assets',
      value: assetRows.length,
      colClass: 'order-2 order-lg-1'
    },
    {
      title: 'current (USD)',
      value: display.fiat(totalFiat),
      colClass: 'order-1 order-lg-2'
    },
    {
      title: '24h ago (USD)',
      value: display.fiat(totalFiat24hAgo),
      colClass: 'order-3'
    },
    {
      title: '24h change',
      value: (<ChangePercent>{totalChange}</ChangePercent>),
      colClass: 'order-4'
    },
  ]

  const renderAssets = () => {
    if (assetRows.length === 0) {
      return (
        <tr className={`text-center ${styles.tableRow}`}>
          <td colSpan='10'>
            <i>No assets to show</i>
          </td>
        </tr>
      )
    }
    return assetRows.map((asset) => {
      const { symbol, name, fiat, balance, price, percentage, change24, infoUrl } = asset
      const displayName = name.length > 12 ? symbol : name
      const displayUnits = (<Units value={balance} symbol={symbol} showSymbol={false}/>)
      const displayUnitsWithSymbol = (<Units value={balance} symbol={symbol} showSymbol={true}/>)
      const displayWeight = display.percentage(percentage)
      const displayChange = (<ChangePercent>{change24}</ChangePercent>)
      const fiatValue = display.fiat(fiat)
      const fiatPrice = display.fiat(price)
      const chartOpen = openCharts[symbol]
      return ([
        <tr key={symbol} onClick={() => toggleChart(symbol)}>
          <td>
            <Row className='no-gutters'>
              <Col {...({ xs: '12', [expandTablePoint]: 'auto' })}>
                <div className={styles.tableCoinIcon} style={{ backgroundImage: `url(${config.siteUrl}/img/coins/coin_${symbol}.png)` }} />
              </Col>
              <Col {...({ xs: '12', [expandTablePoint]: 'auto' })} tag='p' className={styles.tableCoinName}>{displayName}</Col>
            </Row>
          </td>
          <td>
            <p className={expandedOnlyBlock}>{displayUnitsWithSymbol}</p>
            <p className={collapsedOnly}>{displayUnits}</p>
            <p className={collapsedOnly}>{symbol}</p>
          </td>
          <td>
            <p>{fiatValue}</p>
            <p className={collapsedOnly}>{displayWeight}</p>
          </td>
          <td className={expandedOnlyCell}>
            {displayWeight}
          </td>
          <td>
            <p>{fiatPrice}</p>
            <p className={collapsedOnly}>{displayChange}</p>
          </td>
          <td className={expandedOnlyCell}>
            {displayChange}
          </td>
        </tr>,
        <tr key={`${symbol}-priceChart`} className='accordian'>
          <td colSpan='10'>
            <Collapse isOpen={chartOpen}>
              <h5 className='mb-0 mt-2 mx-2'>
                <a href={infoUrl} target='_blank' rel='noopener noreferrer'>
                  <strong>{name}</strong> ({symbol}) <i className='fa fa-external-link' />
                </a>
                <Button color='link' size='sm' onClick={() => toggleChart(symbol)} className='float-right p-0'>close chart</Button>
              </h5>
              <PriceChart symbol={symbol} chartOpen={chartOpen} />
            </Collapse>
          </td>
        </tr>
      ])
    })
  }

  return (
    <Layout {...layoutProps}>
      <Row className='medium-gutters justify-content-end'>
        <Col xs='auto'>
          <Button color='faast' tag={Link} to='/connect'><i className='fa fa-plus'/> add wallet</Button>
        </Col>
        <Col xs='auto'>
          <Button color='faast' tag={Link} to='/modify' disabled={disableModify || viewOnly}><i className='fa fa-edit'/> modify portfolio</Button>
        </Col>
      </Row>
      {!viewOnly &&
        <SignTxModal showModal={showOrderModal} toggleModal={handleToggleOrderModal} view='orderStatus' />
      }
      {!viewOnly &&
        <Welcome />
      }
      {!viewOnly && !!orderStatus &&
        <OrderInProgress status={orderStatus} handleViewStatus={handleToggleOrderModal} />
      }
      <div className='my-3'>
        <Row className='large-gutters'>
          {!isDefaultPortfolioEmpty && (
            <Col xs='12' md='6' lg='5' xl='4'>
              <WalletSelector/>
            </Col>
          )}
          <Col xs='12' md>
            <Row className='medium-gutters'>
              {balancesLoading && (<LoadingFullscreen center error={balancesError}/>)}
              {viewOnly ? (
                <Col xs='12' className='text-center'>
                  <Alert color='info' className='m-0'>
                    You are viewing a read-only wallet. If this is your address, you need to <Link to='/connect' className='font-weight-normal alert-link'><u>connect your wallet</u></Link> in order to trade assets.
                  </Alert>
                </Col>
              ) : (
                <Col xs='12'>
                  <Row className='medium-gutters align-items-end'>
                    <Col>
                      <h5 className='m-0'>{label}</h5>
                    </Col>
                    <Col xs='auto'>
                      <Button color='danger' size='sm' onClick={handleRemove} disabled={disableRemove}>
                        <i className='fa fa-trash'/> remove {isPortfolio ? 'portfolio' : 'wallet'}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              )}
              <Col xs='12'>
                <Card>
                  <CardHeader className='grid-group'>
                    <Row className='medium-gutters'>
                      {stats.map(({ title, value, valueClass, colClass }, i) => (
                        <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
                          <div className='grid-cell'>
                            <div className='text-medium-grey'>{title}</div>
                            <div className={classNames('text-medium', valueClass)}>{value}</div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </CardHeader>
                  <CardBody>
                    {addressProps.address && (
                      <div className='text-right px-3' style={{ lineHeight: 1 }}>
                        <div className='text-medium-grey mb-1'>address</div>
                        <Address className={styles.addressLink} {...addressProps} />
                      </div>
                    )}
                    {pieChart}
                  </CardBody>
                </Card>
              </Col>
              <Col xs='12'>
                <Card>
                  <Table hover striped className={classNames(styles.balanceTable, 'table-accordian')}>
                    <thead>
                      <tr>
                        <th>Asset</th>
                        <th>Units</th>
                        <th>Holdings</th>
                        <th className={expandedOnlyCell}>Weight</th>
                        <th>Price</th>
                        <th className={expandedOnlyCell}>24h change</th>
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
      </div>
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

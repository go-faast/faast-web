import React from 'react'
import PropTypes from 'prop-types'
import {
  Row, Col, Table, Button, Alert, Collapse,
  Card, CardBody, CardHeader, CardTitle, CardSubtitle, CardText
} from 'reactstrap'
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
import WalletSelector from 'Components/WalletSelector'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import OrderStatus from 'Components/OrderStatus'

const { collapseTablePoint } = styles
const expandTablePoint = breakpointNext(collapseTablePoint)

const ChangePercent = ({ children: change }) => <span className={change.isNegative() ? 'text-red' : 'text-green'}>{display.percentage(change, true)}</span>

const BalancesView = (props) => {
  const {
    wallet, viewOnly, orderStatus, addressProps, pieChart,
    toggleChart, layoutProps, showOrderModal, handleToggleOrderModal, handleForgetOrder,
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
            <Row className='gutter-0'>
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
      <Row className='gutter-3 justify-content-end'>
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
      <div className='my-3'>
        <Row className='gutter-4'>
          {!isDefaultPortfolioEmpty && (
            <Col xs='12' md='6' lg='5' xl='4'>
              <WalletSelector/>
            </Col>
          )}
          <Col xs='12' md>
            <Row className='gutter-3'>
              {balancesLoading && (<LoadingFullscreen center error={balancesError}/>)}
              {viewOnly ? (
                <Col xs='12' className='text-center'>
                  <Alert color='info' className='m-0'>
                    You are viewing a read-only wallet. If this is your address, you need to <Link to='/connect' className='font-weight-normal alert-link'><u>connect your wallet</u></Link> in order to trade assets.
                  </Alert>
                </Col>
              ) : (
                <Col xs='12'>
                  <Row className='gutter-3 align-items-end'>
                    <Col>
                      <h4 className='m-0'>{label}</h4>
                    </Col>
                    <Col xs='auto'>
                      <Button color='danger' size='sm' onClick={handleRemove} disabled={disableRemove}>
                        <i className='fa fa-trash'/> remove {isPortfolio ? 'portfolio' : 'wallet'}
                      </Button>
                    </Col>
                  </Row>
                </Col>
              )}
              {!viewOnly && Boolean(orderStatus) &&
                <Col xs='12'>
                  <OrderStatus status={orderStatus} handleViewStatus={handleToggleOrderModal} handleForgetOrder={handleForgetOrder} />
                </Col>
              }
              <Col xs='12'>
                <Card>
                  <CardBody className='grid-group'>
                    <Row className='gutter-3'>
                      {stats.map(({ title, value, valueClass, colClass }, i) => (
                        <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
                          <div className='grid-cell'>
                            <div className='text-medium-grey'>{title}</div>
                            <div className={classNames('text-medium', valueClass)}>{value}</div>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </CardBody>
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

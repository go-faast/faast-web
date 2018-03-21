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
import style from './style'
import WalletSelector from 'Components/WalletSelector'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import OrderStatus from 'Components/OrderStatus'
import CoinIcon from 'Components/CoinIcon'

const { tableExpandPoint: expandPoint } = style

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

  const { expandedOnly, collapsedOnly, collapsedRow } = style

  const stats = [
    {
      title: 'total assets',
      value: assetRows.length,
      colClass: 'order-2 order-lg-1'
    },
    {
      title: 'current holdings',
      value: display.fiat(totalFiat),
      colClass: 'order-1 order-lg-2'
    },
    {
      title: 'holdings 24h ago',
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
        <tr className='text-center'>
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
      const displayWeight = display.percentage(percentage)
      const displayChange = (<ChangePercent>{change24}</ChangePercent>)
      const fiatValue = display.fiat(fiat)
      const fiatPrice = display.fiat(price)
      const chartOpen = openCharts[symbol]
      return ([
        <tr key={symbol} onClick={() => toggleChart(symbol)}>
          <td>
            <CoinIcon coin={symbol} size={1.5}/>
            <span className={classNames(style.coinName, collapsedRow, 'mx-2')}>{displayName}</span>
          </td>
          <td>
            {displayUnits}
            <span className={collapsedRow}>&nbsp;{symbol}</span>
          </td>
          <td>
            {fiatValue}
            <div className={classNames(collapsedOnly, collapsedRow)}>{displayWeight}</div>
          </td>
          <td className={expandedOnly}>
            {displayWeight}
          </td>
          <td>
            {fiatPrice}
            <div className={classNames(collapsedOnly, collapsedRow)}>{displayChange}</div>
          </td>
          <td className={expandedOnly}>
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
        <Row className='gutter-3'>
          {!isDefaultPortfolioEmpty && (
            <Col xs='12' md='6' lg='5' xl='4'>
              <WalletSelector/>
            </Col>
          )}
          <Col xs='12' md='6' lg='7' xl='8'>
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
                      {stats.map(({ title, value, colClass }, i) => (
                        <Col xs='6' lg='3' key={i} className={classNames('text-center', colClass)}>
                          <div className='grid-cell'>
                            <h4>{value}</h4>
                            <h6 className='mb-0'>{title}</h6>
                          </div>
                        </Col>
                      ))}
                    </Row>
                  </CardBody>
                  <CardBody>
                    {addressProps.address && (
                      <div className='text-right px-3' style={{ lineHeight: 1 }}>
                        <div className='text-medium-grey mb-1'>address</div>
                        <Address className={style.addressLink} {...addressProps} />
                      </div>
                    )}
                    {pieChart}
                  </CardBody>
                </Card>
              </Col>
              <Col xs='12'>
                <Card>
                  <Table hover striped className={classNames(style.balanceTable, 'table-accordian')}>
                    <thead>
                      <tr>
                        <th><h6>Asset</h6></th>
                        <th><h6>Units</h6></th>
                        <th><h6>Holdings</h6></th>
                        <th className={expandedOnly}><h6>Weight</h6></th>
                        <th><h6>Price</h6></th>
                        <th className={expandedOnly}><h6>24h change</h6></th>
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

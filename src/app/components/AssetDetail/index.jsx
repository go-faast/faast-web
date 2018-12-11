import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { Card, CardHeader, Row, Col, CardBody, Media, Button } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { getAsset } from 'Selectors/asset'

import conditionalRedirect from 'Hoc/conditionalRedirect'
import routes from 'Routes'

import Layout from 'Components/Layout'
import PriceChart from 'Components/PriceChart'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import AssetSearchBox from 'Components/AssetSearchBox'
import WatchlistStar from 'Components/WatchlistStar'

const getQuery = ({ match }) => match.params.symbol

const marketData = [
  {
    title: 'Market Cap',
    jsonKey: 'marketCap',
    fiat: true,
  },
  {
    title: '24hr Volume',
    jsonKey: 'volume24',
    fiat: true,
  },
  {
    title: 'Supply',
    jsonKey: 'availableSupply',
    fiat: false,
  }
]

const AssetDetail = ({ symbol, asset }) => {
  const { name, price, change24, deposit, receive } = asset
  const buySellButtons = (
    <Row className='gutter-2 justify-content-md-end'>
      <Col xs='auto'>
        <Link to={`/swap?to=${symbol}`}>
          <Button color='success' size='sm' disabled={!receive}>Buy {symbol}</Button>
        </Link>
      </Col>
      <Col xs='auto'>
        <Link to={`/swap?from=${symbol}`} className='d-inline-block'>
          <Button color='danger' size='sm' disabled={!deposit}>Sell {symbol}</Button>
        </Link>
      </Col>
    </Row>
  )
  return (
    <Layout className='pt-3 p-0 p-sm-3'>
      <AssetSearchBox className='mx-3 mx-sm-0 mb-3 ml-md-auto'/>
      <div className='m-3 mx-sm-0 d-lg-none'>
        {buySellButtons}
      </div>
      <Card>
        <CardHeader className='py-2'>
          <Row className='gutter-x-4 gutter-y-3 align-items-center'>
            <Col xs='auto' sm='3' lg='auto' className='d-flex align-items-center pl-3 pl-lg-4'>
              <Media>
                <Media left>
                  <CoinIcon 
                    className='mr-2' 
                    symbol={symbol}
                    inline
                    size={2.5}
                  /> 
                </Media>
                <Media body>
                  <Media className='m-0 font-weight-bold' heading>
                    {name}
                  </Media>
                  <div className='lh-0'>
                    <small className='text-muted'>[{symbol}]</small>
                    <WatchlistStar
                      className='ml-1 d-inline-block align-middle'
                      symbol={symbol}
                    />
                  </div>
                </Media>
              </Media>
            </Col>
            <Col xs='auto' sm='3' lg='2' className='d-flex flex-column'>
              <Units 
                className='d-inline-block font-weight-bold'
                value={price} 
                symbol={'$'} 
                precision={6} 
                symbolSpaced={false}
                prefixSymbol
              />
              <div className='lh-0'>
                <small><ChangePercent>{change24}</ChangePercent></small>
                <PriceArrowIcon
                  className={classNames('d-inline-block align-middle', { 'd-none': change24.isZero() })} 
                  size={.75} dir={change24 < 0 ? 'down' : 'up'} 
                  color={change24 < 0 ? 'danger' : change24 > 0 ? 'success' : null}
                />
              </div>
            </Col>
            <div className='w-100 d-md-none'/>
            {marketData.map(({ title, jsonKey, fiat }, i) => (
              <Col key={i} xs='auto' sm='3' md='auto' className='d-flex flex-column'>
                <small className='text-muted'>{title}</small>
                <Units
                  className='text-nowrap'
                  value={asset[jsonKey]} 
                  symbol={fiat ? '$' : asset.symbol} 
                  precision={6} 
                  prefixSymbol={fiat}
                  symbolSpaced={!fiat}
                  abbreviate
                />
              </Col>
            ))}
            <Col className='d-none d-lg-block'>
              {buySellButtons}
            </Col>
          </Row>
        </CardHeader>
        <CardBody className='text-center'>
          <PriceChart symbol={symbol} chartOpen/> 
        </CardBody>
      </Card>
    </Layout>
  )
}

export default compose(
  setDisplayName('AssetDetail'),
  setPropTypes({
    match: PropTypes.object.isRequired
  }),
  withProps((props) => {
    const symbol = getQuery(props).toUpperCase()
    return ({
      symbol,
    })
  }),
  connect(createStructuredSelector({
    asset: (state, { symbol }) => getAsset(state, symbol),
  }),{
  }),
  conditionalRedirect(
    routes.assetIndex(),
    ({ asset }) => !asset
  ),
)(AssetDetail)

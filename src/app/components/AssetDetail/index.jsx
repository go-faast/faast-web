import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { Card, CardHeader, Row, Col, CardBody, Media } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'
import { getAsset } from 'Selectors/asset'

import conditionalRedirect from 'Hoc/conditionalRedirect'
import routes from 'Routes'

import Layout from 'Components/Layout'
// import PriceChart from 'Components/PriceChart'
import LiveChart from 'Components/LiveTradingViewChart'
import SwapWidget from 'Components/AssetDetailSwapWidget'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import PriceArrowIcon from 'Components/PriceArrowIcon'
import AssetSearchBox from 'Components/AssetSearchBox'
import WatchlistStar from 'Components/WatchlistStar'
import NewsTable from 'Components/NewsTable'
import T from 'Components/i18n/T'

const getQuery = ({ match }) => match.params.symbol

const marketData = [
  {
    title: <T tag='span' i18nKey='app.coinDetail.marketCap'>Market Cap</T>,
    jsonKey: 'marketCap',
    fiat: true,
  },
  {
    title: <T tag='span' i18nKey='app.coinDetail.volume'>24hr Volume</T>,
    jsonKey: 'volume24',
    fiat: true,
  },
  {
    title: <T tag='span' i18nKey='app.coinDetail.supply'>Supply</T>,
    jsonKey: 'availableSupply',
    fiat: false,
  }
]

const AssetDetail = ({ symbol, asset, newsSymbols }) => {
  const { name, price, change24 } = asset
  return (
    <Fragment>
      <Helmet>
        <title>{name} ({symbol}) - Price, Market Data, and Historical Charts</title>
        <meta name='description' content={`Trade ${name} (${symbol}) directly from your hardware or software wallet. View ${name} historic price charts and related cryptocurrency info.`} /> 
      </Helmet>
      <Layout className='pt-3 p-0 p-sm-3'>
        <AssetSearchBox className='mx-3 mx-sm-0 mb-3 ml-md-auto'/>
        <div className='m-3 mx-sm-0 d-lg-none'>
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
                  precision={6} 
                  symbolSpaced={false}
                  prefixSymbol
                  currency
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
                    currency={fiat}
                    precision={6} 
                    prefixSymbol={fiat}
                    symbolSpaced={!fiat}
                    abbreviate
                  />
                </Col>
              ))}
              <Col className='d-none d-lg-block'>
              </Col>
            </Row>
          </CardHeader>
          <CardBody style={{ height: 420 }} className='text-center p-0'>
            <LiveChart symbol={symbol} />
            {/* <PriceChart cmcIDno={cmcIDno} chartOpen/>  */}
          </CardBody>
        </Card>
        <Row className='pb-5 mb-5'>
          <Col lg='6' md='12' className='pr-lg-0 pr-3'>
            <SwapWidget symbol={symbol} />
          </Col>
          <Col>
            <NewsTable symbols={newsSymbols} cardTitle={`${symbol} News`} maxHeight={491} size='sm' />
          </Col>
        </Row>
      </Layout>
    </Fragment>
  )
}

export default compose(
  setDisplayName('AssetDetail'),
  setPropTypes({
    match: PropTypes.object.isRequired
  }),
  withProps((props) => {
    const symbol = getQuery(props).toUpperCase()
    const newsSymbols = [symbol]
    return ({
      symbol,
      newsSymbols
    })
  }),
  connect(createStructuredSelector({
    asset: (state, { symbol }) => getAsset(state, symbol),
  }), {
  }),
  conditionalRedirect(
    routes.assetIndex(),
    ({ asset }) => !asset
  ),
)(AssetDetail)

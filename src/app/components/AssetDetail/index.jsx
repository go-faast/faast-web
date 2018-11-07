import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, setPropTypes, withProps } from 'recompose'
import { Card, CardHeader, Row, Col, CardBody, Media } from 'reactstrap'
import PropTypes from 'prop-types'
import classNames from 'class-names'

import { getAsset } from 'Selectors/asset'
import Layout from 'Components/Layout'
import PriceChart from 'Components/PriceChart'
import CoinIcon from 'Components/CoinIcon'
import Units from 'Components/Units'
import ChangePercent from 'Components/ChangePercent'
import ArrowIcon from 'Components/ArrowIcon'


const getQuery = ({ match }) => match.params.symbol

const marketData = [
  {
    title: 'Market Cap',
    key: 'marketCap',
  },
  {
    title: '24hr Volume',
    key: 'volume24',
  },
  {
    title: 'Available Supply',
    key: 'availableSupply',
  }
]

const AssetDetail = ({ symbol, asset }) => {
  console.log(asset)
  return (
    <Layout className='pt-3 p-0 p-sm-3'>
      <Card>
      <CardHeader className='grid-group'>
        <Row className='gutter-3 p-sm-0 p-3'>
          <Col className='d-flex align-items-center pl-4 py-2 col-auto' size='sm'>
            <Media>
              <Media left>
                <CoinIcon className='mr-2' symbol={symbol} style={{ width: '40px', height: '40px' }} inline/> 
              </Media>
              <Media body>
                <Media className='m-0 font-weight-bold' heading>
                  {asset.name}
                </Media>
                <small className='text-muted'>[{symbol}]</small>
              </Media>
            </Media>
          </Col>
          <Col size='sm'>
            <div className='pl-4 py-2'>
              <div className='mb-0'>
                <Units 
                  className='mt-1 d-inline-block font-weight-bold'
                  value={asset.price} 
                  symbol={'$'} 
                  precision={6} 
                  prefixSymbol
                />
              </div>
              <small style={{ position: 'relative', top: '-5px' }}><ChangePercent>{asset.change24}</ChangePercent></small>
              <ArrowIcon
                style={{ position: 'relative', top: '-5px' }}
                className={classNames('swapChangeArrow', asset.change24.isZero() ? 'd-none' : null)} 
                size={.58} dir={asset.change24 < 0 ? 'down' : 'up'} 
                color={asset.change24 < 0 ? 'danger' : asset.change24 > 0 ? 'success' : null}
              />
            </div>
          </Col>
          <Col className='d-flex align-items-center'>
            <div className='py-2'>
              <div className='d-flex flex-nowrap text-muted mb-0'>
                <span>Buy </span>
                <span>Sell</span>
              </div>
            </div>
          </Col>
          <Col className='col-auto mr-5' size='sm'>
            <div className='py-2'>
              <div className='text-muted mb-0'>
                Holdings
              </div>
              <small className={classNames('mb-0')}>{symbol}</small>
            </div>
          </Col>
          {marketData.map(({ title, key }) => {
            const flag = (key !== 'availableSupply')
            return (
              <Col key={title} className='col-auto ml-2 mr-3' size='sm'>
                <div className='py-2'>
                  <div className='text-muted mb-0'>
                    {title}
                  </div>
                  <Units 
                    value={asset[key]} 
                    symbol={flag ? '$' : asset.symbol} 
                    precision={6} 
                    prefixSymbol={flag}
                  />
                </div>
              </Col>
            )
          })}
        </Row>
      </CardHeader>
      <CardBody>
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
        symbol
      })
    }),
    connect(createStructuredSelector({
      asset: (state, { symbol }) => getAsset(state, symbol),

    }), {
    }),
  )(AssetDetail)

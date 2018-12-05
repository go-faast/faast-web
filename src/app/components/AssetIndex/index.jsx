import React, { Fragment } from 'react'
import * as qs from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps, withState } from 'recompose'
import withToggle from 'Hoc/withToggle'
import { Row, Col, Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap'

import Layout from 'Components/Layout'
import AssetIndexTable from 'Components/AssetIndexTable'
import Paginator from 'Components/Paginator'
import AssetSearchBox from 'Components/AssetSearchBox'
import Loading from 'Components/Loading'

import {
  getAssetIndexPage, getNumberOfAssets, areAssetPricesLoaded, getAssetPricesError,
  getTrendingPositive, getTrendingNegative, getWatchlist
} from 'Selectors'

const AssetIndex = ({ assets, currentPage, numberOfAssets, pricesLoaded, 
  pricesError, watchlist, trendingPositive, trendingNegative, listType, title,
  isDropdownOpen, toggleDropdownOpen, timeFrame, updateTimeFrame
}) => {
  return (
    <Layout className='pt-3'>
      <Row className='justify-content-between align-items-end gutter-x-3'>
        <Col xs='12' sm={{ size: true, order: 2 }}>
          <AssetSearchBox className='float-sm-right'/>
        </Col>
        <Col xs='12' sm={{ size: 'auto', order: 1 }}>
          {listType == '/assets/trending' ? <h4 className='mb-3 text-primary'>{title}
            <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
              <DropdownToggle 
                tag='div'
                className='py-0 px-2 flat d-inline-block position-relative cursor-pointer' 
                style={{ top: '-1px', width: '60px' }}
                caret
              >
                {timeFrame}
              </DropdownToggle>
              <DropdownMenu className='p-0'>
                <DropdownItem 
                  active={timeFrame === '7d'} 
                  onClick={() => updateTimeFrame('7d')}
                  className='py-2'
                >
                  7d
                </DropdownItem>
                <DropdownItem className='m-0' divider/>
                <DropdownItem 
                  active={timeFrame === '1d'} 
                  onClick={() => updateTimeFrame('1d')}
                  className='py-2'
                >
                  1d
                </DropdownItem>
                <DropdownItem className='m-0' divider/>
                <DropdownItem 
                  active={timeFrame === '1h'} 
                  onClick={() => updateTimeFrame('1h')}
                  className='py-2'
                >
                  1h
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </h4> : null}
        </Col>
      </Row>
      {pricesLoaded ? (
        <Fragment>
          {listType === '/assets' ? (
            <Fragment>
              <AssetIndexTable tableHeader={title} assets={assets}/>
              <Paginator page={currentPage} pages={Math.ceil(numberOfAssets / 50)}/>
            </Fragment>
          ) : listType === '/assets/watchlist' ? (
            <AssetIndexTable tableHeader={title} assets={watchlist}/>
          ) : (
            <Fragment>
              <AssetIndexTable 
                defaultPriceChange={timeFrame} 
                tableHeader={'Biggest Gainers'} 
                assets={trendingPositive}
              />
              <AssetIndexTable 
                tableHeader={'Biggest Losers'} 
                assets={trendingNegative}
                defaultPriceChange={timeFrame}
              />
            </Fragment>
          )}
        </Fragment>
      ) : (
        <Loading center label='Loading market data...' error={pricesError}/>
      )}
    </Layout>
  )
}

export default compose(
  setDisplayName('AssetIndex'),
  withState('timeFrame', 'updateTimeFrame', '1d'),
  withToggle('dropdownOpen'),
  withRouter,
  withProps(({ location, timeFrame }) => {
    const listType = location.pathname
    let title = listType == '/assets' ? 'All Assets' :
      listType == '/assets/watchlist' ? 'Watchlist' : 'Trending'
    const urlParams = qs.parse(location.search)
    let { page: currentPage = 1 } = urlParams
    currentPage = parseInt(currentPage)
    title = currentPage > 1 && listType == '/assets' ? (<span>{title} - Page {currentPage}</span>) : title
    const page = currentPage - 1
    const sortField = 'marketCap'
    const limit = 50
    const trendingTimeFrame = timeFrame === '1d' ? 'change24' : timeFrame === '7d' ? 'change7d' : 'change1'
    return ({
      currentPage,
      page,
      limit,
      sortField,
      listType,
      title,
      trendingTimeFrame
    })
  }),
  connect(createStructuredSelector({
    assets: (state, { page, limit, sortField }) => getAssetIndexPage(state, { page, limit, sortField }),
    trendingPositive: (state, { trendingTimeFrame }) => getTrendingPositive(state, { sortField: trendingTimeFrame, n: 15 }),
    trendingNegative: (state, { trendingTimeFrame }) => getTrendingNegative(state, { sortField: trendingTimeFrame, n: 15 }),
    watchlist: getWatchlist,
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError,
    numberOfAssets: getNumberOfAssets
  }), {
  }),
)(AssetIndex)

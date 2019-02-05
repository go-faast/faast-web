import React from 'react'
import { push as pushAction } from 'react-router-redux'
import routes from 'Routes'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'
import withToggle from 'Hoc/withToggle'
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap'

import AssetIndexTable from 'Components/AssetIndexTable'
import Layout from 'Components/Layout'
import LoadingFullscreen from 'Components/LoadingFullscreen'

import { getTrendingPositive, getTrendingNegative, areAssetPricesLoaded, getAssetPricesError } from 'Selectors'

const getQuery = ({ match }) => match.params.timeFrame

const AssetTrending = ({ trendingPositive, trendingNegative,
  isDropdownOpen, toggleDropdownOpen, timeFrame, push, pricesLoaded, pricesError
}) => {
  return pricesLoaded ? (
    <Layout className='pt-3'>
      <AssetIndexTable 
        defaultPriceChange={timeFrame} 
        tableHeader={'Biggest Gainers'} 
        assets={trendingPositive}
        allowSorting={false}
        heading={(
          <h4 className='mb-3 text-primary'>
            <Dropdown group isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
              <DropdownToggle 
                tag='div'
                className='py-0 px-2 flat d-inline-block position-relative cursor-pointer' 
                style={{ top: '-1px', width: '100%' }}
                caret
              >
                Trending {timeFrame}
              </DropdownToggle>
              <DropdownMenu className='p-0'>
                <DropdownItem 
                  active={timeFrame === '7d'} 
                  onClick={() => push(routes.trending('7d'))}
                  className='py-2'
                >
                7d
                </DropdownItem>
                <DropdownItem className='m-0' divider/>
                <DropdownItem 
                  active={timeFrame === '1d'} 
                  onClick={() => push(routes.trending('1d'))}
                  className='py-2'
                >
                1d
                </DropdownItem>
                <DropdownItem className='m-0' divider/>
                <DropdownItem 
                  active={timeFrame === '1h'} 
                  onClick={() => push(routes.trending('1h'))}
                  className='py-2'
                >
                1h
                </DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </h4>
        )}
      />
      <AssetIndexTable 
        tableHeader={'Biggest Losers'} 
        assets={trendingNegative}
        defaultPriceChange={timeFrame}
        allowSorting={false}
        showSearch={false}
      />
    </Layout>) : (
    <LoadingFullscreen center label='Loading market data...' error={pricesError}/>
  )
}

export default compose(
  setDisplayName('AssetTrending'),
  withToggle('dropdownOpen'),
  withProps((props) => {
    const timeFrame = getQuery(props) || '1d'
    const trendingTimeFrame = timeFrame === '1d' ? 'change24' : timeFrame === '7d' ? 'change7d' : 'change1'
    return ({
      timeFrame,
      trendingTimeFrame
    })
  }),
  connect(createStructuredSelector({
    trendingPositive: (state, { trendingTimeFrame }) => getTrendingPositive(state, { sortField: trendingTimeFrame, n: 15 }),
    trendingNegative: (state, { trendingTimeFrame }) => getTrendingNegative(state, { sortField: trendingTimeFrame, n: 15 }),
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError
  }), {
    push: pushAction
  }),
)(AssetTrending)

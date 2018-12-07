import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withState, withProps } from 'recompose'
import withToggle from 'Hoc/withToggle'
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu } from 'reactstrap'

import AssetIndexTable from 'Components/AssetIndexTable'
import Layout from 'Components/Layout'

import { getTrendingPositive, getTrendingNegative } from 'Selectors'

const AssetTrending = ({ trendingPositive, trendingNegative,
  isDropdownOpen, toggleDropdownOpen, timeFrame, updateTimeFrame
}) => {
  return (
    <Layout className='pt-3 p-0 p-sm-3'>
      <AssetIndexTable 
        defaultPriceChange={timeFrame} 
        tableHeader={'Biggest Gainers'} 
        assets={trendingPositive}
        allowSorting={false}
        heading={(
          <h4 className='mb-3 text-primary'>Trending
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
    </Layout>
  )
}

export default compose(
  setDisplayName('AssetTrending'),
  withState('timeFrame', 'updateTimeFrame', '1d'),
  withToggle('dropdownOpen'),
  withProps(({ timeFrame }) => {
    const trendingTimeFrame = timeFrame === '1d' ? 'change24' : timeFrame === '7d' ? 'change7d' : 'change1'
    return ({
      trendingTimeFrame
    })
  }),
  connect(createStructuredSelector({
    trendingPositive: (state, { trendingTimeFrame }) => getTrendingPositive(state, { sortField: trendingTimeFrame, n: 15 }),
    trendingNegative: (state, { trendingTimeFrame }) => getTrendingNegative(state, { sortField: trendingTimeFrame, n: 15 }),
  }), {
  }),
)(AssetTrending)

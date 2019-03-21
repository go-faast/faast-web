import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { push as pushAction } from 'react-router-redux'
import routes from 'Routes'
import { connect } from 'react-redux'
import { reduxForm } from 'redux-form'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps, withHandlers } from 'recompose'
import withToggle from 'Hoc/withToggle'
import { Dropdown, DropdownItem, DropdownToggle, DropdownMenu,  } from 'reactstrap'

import AssetIndexTable from 'Components/AssetIndexTable'
import Layout from 'Components/Layout'
import LoadingFullscreen from 'Components/LoadingFullscreen'

import Checkbox from 'Components/Checkbox'

import { getTrendingPositive, getTrendingNegative, areAssetPricesLoaded, getAssetPricesError, getTradeableAssetFilter } from 'Selectors'
import { toggleAssetsByTradeable } from 'Actions/app'

const getQuery = ({ match }) => match.params.timeFrame

const AssetTrending = ({ trendingPositive, trendingNegative,
  isDropdownOpen, toggleDropdownOpen, timeFrame, push, pricesLoaded, pricesError,
  handleFilterTradeable, filterTradeable
}) => {
  return pricesLoaded ? (
    <Fragment>
      <Helmet>
        <title>Cryptocurrency Trending Price Gainers and Losers - Faa.st</title>
        <meta name='description' content='The biggest gainers and losers trending in the cryptocurrency space over the last hour, day, and week.' /> 
      </Helmet>
      <Layout className='pt-3'>
        <AssetIndexTable 
          defaultPriceChange={timeFrame} 
          tableHeader={'Biggest Gainers'} 
          assets={trendingPositive}
          allowSorting={false}
          heading={(
            <Fragment>
              <h4 className='text-primary mb-3 d-inline-block'>
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
              <small>
                <Checkbox 
                  checked={filterTradeable}
                  className='ml-2 d-inline-block'
                  onChange={handleFilterTradeable} 
                  label={<span style={{ top: 2 }} className='text-muted d-inline-block position-relative'>Show only tradeable assets</span>}
                  required={false}
                />
              </small>
            </Fragment>
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
    </Fragment>) : (
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
      trendingTimeFrame,
    })
  }),
  connect(createStructuredSelector({
    filterTradeable: getTradeableAssetFilter
  })),
  connect(createStructuredSelector({
    trendingPositive: (state, { trendingTimeFrame, filterTradeable }) => getTrendingPositive(state, { sortField: trendingTimeFrame, n: 15, filterTradeable }),
    trendingNegative: (state, { trendingTimeFrame, filterTradeable }) => getTrendingNegative(state, { sortField: trendingTimeFrame, n: 15, filterTradeable }),
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError,
  }), {
    push: pushAction,
    toggleAssetsByTradeable
  }),
  withHandlers({
    handleFilterTradeable: ({ toggleAssetsByTradeable }) => () => {
      toggleAssetsByTradeable()
    }
  }),
  reduxForm({
    form: 'tradeableForm'
  })
)(AssetTrending)

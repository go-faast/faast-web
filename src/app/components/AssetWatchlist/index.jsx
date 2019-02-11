import React, { Fragment } from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName } from 'recompose'

import AssetIndexTable from 'Components/AssetIndexTable'
import Layout from 'Components/Layout'
import LoadingFullscreen from 'Components/LoadingFullscreen'

import { getWatchlist, areAssetPricesLoaded, getAssetPricesError } from 'Selectors'

const AssetWatchlist = ({ watchlist, pricesLoaded, pricesError }) => (
  pricesLoaded ? (
    <Fragment>
      <Helmet>
        <title>Cryptocurrency Watchlist - Faa.st</title>
        <meta name='description' content='Save your favorite cryptocurrencies on a personalized watchlist and keep track of price, market, volume and supply data.' /> 
      </Helmet>
      <Layout className='pt-3'>
        <AssetIndexTable tableHeader={'Watchlist'} assets={watchlist}/>
      </Layout>
    </Fragment>) : (
    <LoadingFullscreen center label='Loading market data...' error={pricesError}/>
  )
)

export default compose(
  setDisplayName('AssetWatchlist'),
  withRouter,
  connect(createStructuredSelector({
    watchlist: getWatchlist,
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError
  }), {
  }),
)(AssetWatchlist)

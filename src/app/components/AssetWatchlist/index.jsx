import React from 'react'
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
    <Layout className='pt-3 p-0 p-sm-3'>
      <AssetIndexTable tableHeader={'Watchlist'} assets={watchlist}/>
    </Layout>) : (
    <LoadingFullscreen center label='Loading market data...' error={pricesError}/>
  )
)

export default compose(
  setDisplayName('AssetWatchlist'),
  withRouter,
  connect(createStructuredSelector({
    watchlist: getWatchlist,
    pricesLoaded: areAssetPricesLoaded,
    pricesErorr: getAssetPricesError
  }), {
  }),
)(AssetWatchlist)

import React from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName } from 'recompose'

import AssetIndexTable from 'Components/AssetIndexTable'
import Layout from 'Components/Layout'

import { getWatchlist } from 'Selectors'

const AssetWatchlist = ({ watchlist }) => (
  <Layout className='pt-3 p-0 p-sm-3'>
    <AssetIndexTable tableHeader={'Watchlist'} assets={watchlist}/>
  </Layout>
)

export default compose(
  setDisplayName('AssetWatchlist'),
  withRouter,
  connect(createStructuredSelector({
    watchlist: getWatchlist
  }), {
  }),
)(AssetWatchlist)

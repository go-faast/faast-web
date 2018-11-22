import React from 'react'
import * as qs from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'

import Layout from 'Components/Layout'
import AssetIndexTable from 'Components/AssetIndexTable'
import Paginator from 'Components/Paginator'
import AssetSearch from 'Components/AssetSearch'

import { getAssetIndexPage, getNumberOfAssets } from 'Selectors/asset'

const AssetIndex = ({ assets, currentPage, numberOfAssets }) => {
  return (
    <Layout className='pt-3'>
      <h4 className='pt-4 mb-0 text-primary d-inline-block float-left'>All Coins 
        {currentPage > 1 ? (<span> - Page {currentPage}</span>) : null}
      </h4>
      <AssetSearch 
        inputGroupProps={{ style: { width: '100%', maxWidth: '300px' }, className: 'pl-3 pl-md-0 my-3 float-left float-sm-right' }}
      />
      <AssetIndexTable assets={assets}/>
      <Paginator page={currentPage} pages={Math.ceil(numberOfAssets / 50)}/>
    </Layout>
  )
}

export default compose(
  setDisplayName('AssetIndex'),
  withRouter,
  withProps(({ location }) => {
    const urlParams = qs.parse(location.search)
    let { page: currentPage = 1 } = urlParams
    currentPage = parseInt(currentPage)
    const page = currentPage - 1
    const sortField = 'marketCap'
    const limit = 50
    return ({
      currentPage,
      page,
      limit,
      sortField 
    })
  }),
  connect(createStructuredSelector({
    assets: (state, { page, limit, sortField }) => getAssetIndexPage(state, { page, limit, sortField }),
    numberOfAssets: getNumberOfAssets
  }), {
  }),
)(AssetIndex)

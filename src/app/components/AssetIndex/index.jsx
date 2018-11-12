import React from 'react'
import * as qs from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import AssetIndexTable from 'Components/AssetIndexTable'
import { getAssetIndexPage, getNumberOfAssets } from 'Selectors/asset'
import Paginator from 'Components/Paginator'

const AssetIndex = ({ assets, currentPage, numberOfAssets }) => {
  return (
    <Layout>
       <h4 className='mt-5 pt-4 mb-2 text-primary'>All Coins 
        {currentPage > 1 ? (<span> - Page {currentPage}</span>) : null}
      </h4>
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

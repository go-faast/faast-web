import React from 'react'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'
import Layout from 'Components/Layout'
import AssetIndexTable from 'Components/AssetIndexTable'
import { getAssetIndexPage } from 'Selectors/asset'

const getQuery = ({ match }) => match.params.pageNumber || 0

const AssetIndex = ({ assets }) => {
  return (
    <Layout>
       <h4 className='mt-5 pt-4 mb-2 text-primary'>Faast Coin Index</h4>
      <AssetIndexTable assets={assets} />
    </Layout>
  )
}

export default compose(
    setDisplayName('AssetIndex'),
    withProps((props) => {
      let page = getQuery(props)
      const sortField = 'marketCap'
      const limit = 50
      return ({
        page,
        limit,
        sortField 
      })
    }),
    connect(createStructuredSelector({
      assets: (state, { page, limit, sortField }) => getAssetIndexPage(state, { page, limit, sortField }),
    }), {
    }),
  )(AssetIndex)

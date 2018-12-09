import React, { Fragment } from 'react'
import * as qs from 'query-string'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, withProps } from 'recompose'
import { Row, Col } from 'reactstrap'

import Layout from 'Components/Layout'
import AssetIndexTable from 'Components/AssetIndexTable'
import Paginator from 'Components/Paginator'
import AssetSearchBox from 'Components/AssetSearchBox'
import Loading from 'Components/Loading'

import {
  getAssetIndexPage, getNumberOfAssets, areAssetPricesLoaded, getAssetPricesError
} from 'Selectors/asset'

const AssetIndex = ({ assets, currentPage, numberOfAssets, pricesLoaded, pricesError }) => {
  return (
    <Layout className='pt-3'>
      <Row className='justify-content-between align-items-end gutter-x-3'>
        <Col xs='12' sm={{ size: true, order: 2 }}>
          <AssetSearchBox className='float-sm-right'/>
        </Col>
        <Col xs='12' sm={{ size: 'auto', order: 1 }}>
          <h4 className='mb-3 text-primary'>All Assets
            {currentPage > 1 ? (<span> - Page {currentPage}</span>) : null}
          </h4>
        </Col>
      </Row>
      {pricesLoaded ? (
        <Fragment>
          <AssetIndexTable assets={assets}/>
          <Paginator page={currentPage} pages={Math.ceil(numberOfAssets / 50)}/>
        </Fragment>
      ) : (
        <Loading center label='Loading market data...' error={pricesError}/>
      )}
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
    pricesLoaded: areAssetPricesLoaded,
    pricesError: getAssetPricesError,
    numberOfAssets: getNumberOfAssets
  }), {
  }),
)(AssetIndex)

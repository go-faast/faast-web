import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'

// import logoImg from 'Img/faast-logo.png'

import Features from 'Site/components/Features1'
import Footer from 'Site/components/Footer1'
import Hero from 'Site/components/Hero1'
import Wallets from 'Site/components/Wallets'
import Terminal from 'Site/components/Terminal'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'



export default compose(
  setDisplayName('Home'),
  withTracker,
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded
  }), {
    retrieveAssets,
    fetchGeoRestrictions
  }),
  withProps(({ assets }) => ({
    assetList: assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'marketCap'))
  })),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, assetList, translations = {} }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  return (
    <div style={{ backgroundColor: '#fff' }}>
      <Hero supportedAssets={supportedAssets} translations={translations} className='mb-md-5 mb-0'/>
      <Features translations={translations} supportedAssets={supportedAssets} />
      <Wallets translations={translations} />
      <Terminal translations={translations} />
      <Footer translations={translations} />
    </div>
  )
})

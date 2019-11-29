import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Button } from 'reactstrap'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'

import Footer from 'Site/components/Footer'
import Features from 'Site/components/Features'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

export default compose(
  setDisplayName('Affiliate'),
  withTracker,
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded,
  }), {
    retrieveAssets,
    fetchGeoRestrictions
  }),
  withProps(({ assets }) => ({
    assetList: assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl', 'cmcIDno'))
  })),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, translations, assetList }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  return (
    <div>
      <Hero
        supportedAssets={supportedAssets}
        translations={translations}
        headline={(
          <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
            Integrate Faa.st into your Wallet, Exchange, or Website and earn fees in Bitcoin
          </h1>
        )}
        subline={<span>The Faa.st API makes multi-coin exchanges quick and easy</span>}
        notification={<span>Check out the Faa.st API docs to get started</span>}
        notificationLink={'https://api.faa.st'}
        cta={<Button color='primary' tag='a' href='https://api.faa.st'>Get Started Now</Button>}
        bgColor={'#323540'}
        bgImage={'none'}
        showMacScreenShot={false}
      />
      <Footer translations={translations} />
    </div>
  )
})

import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'

import PriceChart from 'Components/PriceChart'

import Footer from 'Site/components/Footer'
import Features from 'Site/components/Features'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

export default compose(
  setDisplayName('Pairs'),
  connect(createStructuredSelector({
    assets: getAllAssetsArray,
    areAssetsLoaded: areAssetsLoaded,
  }), {
    retrieveAssets,
    fetchGeoRestrictions
  }),
  withProps(({ assets }) => ({
    assetList: assets.filter(({ deposit, receive }) => deposit || receive)
      .map((asset) => pick(asset, 'symbol', 'name', 'iconUrl'))
  })),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, assetList, symbol, name, type, descriptions = {} }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  const toSymbol = type === 'buy' ? symbol : symbol === 'ETH' ? 'BTC' : 'ETH'
  const fromSymbol = type === 'sell' ? symbol : symbol === 'BTC' ? 'ETH' : 'BTC'
  return (
    <div>
      <Hero 
        to={toSymbol} 
        from={fromSymbol} 
        supportedAssets={supportedAssets}
        headline={(
          <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
            <span className='special-word'>Instantly</span> {type} {name} ({symbol}) from your Ledger, Trezor, or MetaMask.
          </h1>
        )} 
        type='pair'
      />
      <div style={{ backgroundColor: '#fff' }}>
        <div 
          className='features-clean pb-0 text-center cursor-pointer'
        > 
          <h2 className='text-center' style={{ marginBottom: '15px', fontWeight: 'normal' }}>
            {name} ({symbol}) Information
          </h2>
          <div className='mx-auto' style={{ minHeight: 300, maxWidth: 960 }}>
            <p>{descriptions[symbol] ? descriptions[symbol].overview : null}</p>
            <PriceChart symbol={symbol} chartOpen/> 
          </div>
        </div>
      </div>
      <Features supportedAssets={supportedAssets} />
      <Footer/>
    </div>
  )
})

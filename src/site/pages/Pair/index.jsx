import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps, withState } from 'recompose'

import PriceChart from 'Components/PriceChart'

// import logoImg from 'Img/faast-logo.png'
import Footer from 'Site/components/Footer'
import Features from 'Site/components/Features'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import classNames from 'class-names'

import { selectedChartButton } from './style.scss'

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
  withState('selectedChart', 'updateSelectedChart', undefined),
  lifecycle({
    componentWillMount() {
      const { fetchGeoRestrictions, retrieveAssets } = this.props
      fetchGeoRestrictions()
      retrieveAssets()
    }
  }),
  withRouteData,
)(({ supportedAssets, areAssetsLoaded, assetList, toSymbol, toName, fromName, fromSymbol, updateSelectedChart, selectedChart, 
  descriptions }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  selectedChart = selectedChart ? selectedChart : fromSymbol
  return (
    <div>
      <Hero 
        to={toSymbol} 
        from={fromSymbol} 
        supportedAssets={supportedAssets}
        headline={(
          <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
            <span className='special-word'>Instantly</span> trade {fromSymbol} for {toSymbol} from your Ledger, Trezor, or MetaMask.
          </h1>
        )} 
      />
      <div style={{ backgroundColor: '#fff' }}>
        <div 
          className='mx-auto w-75 features-clean pb-0 text-center cursor-pointer'
        > 
          <h2 className='text-center' style={{ marginBottom: '15px', fontWeight: 'normal' }}>
            {selectedChart === fromSymbol ? `${fromName} (${fromSymbol})` : `${toName} (${toSymbol})`} Information
          </h2>
          <div style={{ minHeight: 300, maxWidth: 960 }}>
            <p>{selectedChart === fromSymbol && descriptions[fromSymbol] ? descriptions[fromSymbol].overview 
              : selectedChart === toSymbol && descriptions[toSymbol] ? descriptions[toSymbol].overview : null}</p>
            <PriceChart symbol={selectedChart} chartOpen/> 
          </div>
          <div
            style={{ border: '1px solid #e3edf3', background: '#eff4f7', 
              borderRadius: 20, maxWidth: '140px', height: 30 }} 
            className='text-center mx-auto mt-2'
          >
            <div 
              onClick={() => updateSelectedChart(fromSymbol)}
              className={classNames(selectedChart == fromSymbol ? selectedChartButton : null, 'd-inline-block w-50')} 
            >
              {fromSymbol}
            </div>
            <div 
              onClick={() => updateSelectedChart(toSymbol)}
              className={classNames(selectedChart == toSymbol ? selectedChartButton : null, 'd-inline-block w-50')}
            >
              {toSymbol}
            </div>
          </div>
        </div>
      </div>
      <Features supportedAssets={supportedAssets} />
      <Footer/>
    </div>
  )
})

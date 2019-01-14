import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps, withState } from 'recompose'
import { Container, Row, Col } from 'reactstrap'

import PriceChart from 'Components/PriceChart'

// import logoImg from 'Img/faast-logo.png'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import SwapWidget from 'Site/components/SwapWidget'
import Features from 'Site/components/Features'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import MoonBackground from 'Img/moon-background.jpg'
import MacbookScreenshot1 from 'Img/macbook-screenshot-01.png'

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
)(({ supportedAssets, areAssetsLoaded, assetList, pair, updateSelectedChart, selectedChart, 
  descriptions }) => {
  supportedAssets = areAssetsLoaded ? assetList : supportedAssets
  const defaultDeposit = pair.split('-')[0]
  const defaultReceive = pair.split('-')[1]
  selectedChart = selectedChart ? selectedChart : defaultDeposit
  return (
    <div>
      <div>
        <Header/>
        <div className='jumbotron jumbotron-fluid hero-technology mb-0' style={{
          backgroundImage: `url(${MoonBackground})`,
          height: '759px',
          backgroundPosition: '50% 25px',
          backgroundSize: '1400px',
          backgroundRepeat: 'no-repeat',
          marginTop: '-160px',
          paddingTop: '220px',
          backgroundColor: 'rgba(0,26,23)',
        }}>
          <Container>
            <Row>
              <Col sm='12' lg='6' className='text-left pl-md-5 pl-0 ml-4'>
                <a href='https://medium.com/faast/faast-swap-api-is-now-available-959091bc85ca' target='_blank noopener'>
                  <div className='notification'>
                    <span className='new-pill'>new</span>
                  Read about the Faa.st affiliate program
                  </div>
                </a>
                <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
                  <span className='special-word'>Instantly</span> trade {defaultDeposit} for {defaultReceive} from your Ledger, Trezor, or MetaMask.
                </h1>
                <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal' }}>
                  The <span className='special-word'>safest</span> way to to build a diversified cryptocurrency portfolio
                </p>
                <p><a className='btn btn-primary btn-lg hero-button py-2' role='button' href='/app'>
            Create A Portfolio
                </a></p>
              </Col>
              <Col className='pr-3 d-md-block d-none'>
                <SwapWidget defaultDeposit={defaultDeposit} defaultReceive={defaultReceive} assets={supportedAssets}/>
              </Col>
              <div className='intro d-md-none d-block mx-auto' style={{ paddingTop: '60px', maxWidth: 400 }}>	
                <img className='img-fluid' src={MacbookScreenshot1} style={{ height: '100%', width: '730px' }}/>	
              </div>
            </Row>
          </Container>
        </div>
      </div>
      <div style={{ backgroundColor: '#fff' }}>
        <div 
          className='mx-auto w-75 features-clean pb-0 text-center cursor-pointer'
        > 
          <h2 className='text-center' style={{ marginBottom: '15px', fontWeight: 'normal' }}>{selectedChart} Coin Information</h2>
          <div style={{ minHeight: 300, maxWidth: 960 }}>
            <p>{selectedChart === defaultDeposit && descriptions[defaultDeposit] ? descriptions[defaultDeposit].overview 
              : selectedChart === defaultReceive && descriptions[defaultReceive] ? descriptions[defaultReceive].overview : null}</p>
            <PriceChart symbol={selectedChart} chartOpen/> 
          </div>
          <div
            style={{ border: '1px solid #e3edf3', background: '#eff4f7', 
              borderRadius: 20, maxWidth: '140px', height: 30 }} 
            className='text-center mx-auto mt-2'
          >
            <div 
              onClick={() => updateSelectedChart(defaultDeposit)}
              className={classNames(selectedChart == defaultDeposit ? selectedChartButton : null, 'd-inline-block w-50')} 
            >
              {defaultDeposit}
            </div>
            <div 
              onClick={() => updateSelectedChart(defaultReceive)}
              className={classNames(selectedChart == defaultReceive ? selectedChartButton : null, 'd-inline-block w-50')}
            >
              {defaultReceive}
            </div>
          </div>
        </div>
      </div>
      <Features supportedAssets={supportedAssets} />
      <Footer/>
    </div>
  )
})

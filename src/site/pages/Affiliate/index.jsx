import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button } from 'reactstrap'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import classNames from 'class-names'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'
import AffiliateContact from 'Site/components/AffiliateContact'

import Footer from 'Site/components/Footer'
import Hero from 'Site/components/Hero'

import supportImg from 'Img/affiliate-support.png'
import chartImg from 'Img/affiliate-dashboard.png'
import coinsImg from 'Img/affiliate-payout.png'

import bitcoin from 'Img/bitcoinAffiliate.svg'
import monitor from 'Img/monitor.svg'
import adjust from 'Img/adjust.svg'
import code from 'Img/code.svg'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import style from './style.scss'

const features = [{
  icon: bitcoin,
  heading: 'Monetization',
  description: 'Faa.st allows you to easily monetize your site or application by integrating our Faa.st API into your product or service. This enables your users to instantly swap cryptos while you earn a percentage of every transaction.',
},
{
  icon: code,
  heading: 'Simplicity',
  description: 'The team at Faa.st worked hard on simplifying the technical areas to allow quick and easy installations. So no matter your project, the Faa.st API contains simple commands that allow you to easily process and detail transactions.',
},
{
  icon: adjust,
  heading: 'Customizable Fees',
  description: 'Unlike other exchange services, Faa.st offers customizable fixed or marginal fees on transactions. This allows you to choose the right monetization model for your use case, and charge accordingly.',
},
{
  icon: monitor,
  heading: 'Monitoring',
  description: 'Faa.st affiliates gain access to a built-in affiliate dashboard that allows you to track your earnings per transaction, monitor the swaps through integration, and withdraw your BTC payouts.',
}]

const press = [{
  title: 'Faast Platform Connects With Popular Wallets Offering Cross-Chain Swaps',
  domain: 'news.bitcoin.com',
  url: 'https://news.bitcoin.com/faast-platform-connects-with-popular-wallets-offering-cross-chain-swaps/',
  image: 'https://news.bitcoin.com/wp-content/uploads/2018/05/Gtech-1520x1024.jpg',
}, {
  title: 'ShapeShift Versus Faast: Which Non-Custodial Exchange is Right for You?',
  domain: 'bitcoinexchangeguide.com',
  url: 'https://bitcoinexchangeguide.com/shapeshift-vs-faast/',
  image: 'https://598426.smushcdn.com/1608368/wp-content/uploads/2018/09/ShapeShift-Versus-Faast-Which-Non-Custodial-Exchange-is-Right-for-You.jpg?lossy=1&strip=1&webp=1'
}]

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
      <div className='text-dark' style={{ backgroundColor: '#323540' }}>
        <div className='position-relative'>
          <div className='position-relative' style={{ zIndex: 9 }}>
            <Hero
              supportedAssets={supportedAssets}
              translations={translations}
              headline={(
                <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
                  Integrate Faa.st into your Wallet or Exchange and earn fees in Bitcoin
                </h1>
              )}
              rightHero={<AffiliateContact />}
              subline={<span>The Faa.st API makes multi-coin exchanges quick, easy, and profitable</span>}
              notification={<span>Read our article outlining Faa.st integration</span>}
              notificationLink={'https://api.faa.st'}
              cta={(
                <Button 
                  tag='a' 
                  className='btn btn-primary btn-lg hero-button py-2' 
                  color='primary'
                  role='button' 
                  href='https://faa.st/app/affiliates/signup'>
                    Create an affiliate account
                </Button> 
              )}
              bgColor={'transparent'}
              bgImage={'https://i.imgur.com/CKbwoEu.png'}
              showMacScreenShot={false}
            />
          </div>
          <div style={{ bottom: 0, left: 0, zIndex: 1 }} className='position-absolute'>
            <img style={{ width: '100%', maxHeight: 551, pointerEvents: 'none' }} src='https://i.imgur.com/CKbwoEu.png' />
          </div>
        </div>
        <div style={{ backgroundColor: '#fff' }}>
          <Row className='text-center py-5 px-0 mx-2'>
            <Col xs='12'>
              <h1 className='mb-3 mt-xs-5 mt-lg-0 mt-0 pt-xs-5 pt-lg-0 pt-0' style={{ fontWeight: 600 }}>Why Integrate with Faa.st?</h1>
            </Col>
            <Col className='mt-4' xs='12'>
              <Row className='mt-3 justify-content-center'>
                {features.map((f,i) => (
                  <Col style={{ borderRadius: 4, boxShadow: 'rgba(200, 216, 236, 0.5) 0px 5px 11px 1px' }} key={i} xs='12' md='5' className='text-left mb-4 px-3 py-4 mr-4'>
                    <h4 style={{ fontWeight: 600 }}>
                      <img className='mr-2' width='25' height='25' src={f.icon} /> {f.heading}
                    </h4> 
                    {f.description}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
          <Row className='text-center py-5 px-4 mx-0 mb-5'>
            <Col className='pb-5 mb-3 px-0' xs='12'>
              <h2 style={{ fontWeight: 600 }}>Dashboard Features</h2>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='80' src={supportImg} />
                </Col>
                <Col>
                We provide full 24 hour support to answer any questions you may have
                </Col>
              </Row>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='80' src={chartImg} />
                </Col>
                <Col>
                Keep track of your completed swaps and earned fees with our affiliate dashboard
                </Col>
              </Row>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='80' src={coinsImg} />
                </Col>
                <Col>
                Initiate a BTC payout of your earned fees, in one click, directly from the affiliate dashboard
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ backgroundColor: '#F6FAFE' }} className='text-center py-5 px-0 mx-0'>
            <Col className='px-0' xs='12'>
              <h2 className='pb-0 mb-3' style={{ fontWeight: 600 }}>Joins our partners</h2>
              <h5 style={{ opacity: .75 }}>These crypto companies are already integrated into Faa.st</h5>
            </Col>
            <Col className='px-0'>
              <Row className='d-flex align-items-center justify-content-center mx-0'>
                <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://s3-ap-southeast-1.amazonaws.com/cs-public-uploads-prod/131139e0-f4f7-4813-b119-ba6db0514de0?v=4638754' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='260' src='https://www.emberfund.io/images/logo-horizontal.svg' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://en.bitcoinwiki.org/upload/en/images/f/f9/Edge.png' />
                </Col>
                {/* <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://trezor.io/static/images/trezor-logo-black.png' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://www.ledger.com/wp-content/themes/ledger-v2/public/images/ledger.svg' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='70' src='https://lh3.googleusercontent.com/3pwxYyiwivFCYflDJtyWDnJ3ZgYuN_wBQBHqCXbKh9tJTdTL1uOrY1VyxeC_yXLTNZk' />
                </Col> */}
              </Row>
            </Col>
          </Row>
          <Row className='text-center py-5 px-4 mx-0'>
            <Col className='pb-5 px-0' xs='12'>
              <h2 style={{ fontWeight: 600 }}>Faa.st Press</h2>
            </Col>
            {press.map((p, i) => (
              <Col key={i} tag={'a'} href={p.url} xs='12' className='d-flex justify-content-center px-0 text-dark' target='_blank noreferrer'>
                <Row style={{ border: '1px solid #ECEFF7', borderRadius: 4, maxWidth: 700, width: '100%' }} className='py-3 px-3 mb-3'>
                  <Col className='px-0' xs='3'>
                    <img width='100' src={p.image}></img>
                  </Col>
                  <Col className='px-0'>
                    <Row>
                      <Col className='text-left'>
                        <p className='m-0'>{p.title}</p>
                        <small className='text-primary'>
                          <p className='m-0'>{p.domain}</p>
                        </small>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            ))}
          </Row>
          <Row className='text-center py-5 mx-0 mt-5 text-white' style={{ backgroundColor: '#374B5D' }}>
            <Col className='mb-3' xs='12'>
              <h2 style={{ fontWeight: 600 }}>How to set up</h2>
            </Col>
            <Col xs='12'>
              <Row>
                <Col>
                  <h1 className={classNames(style.numbers, 'font-weight-bold')}>1</h1>
                  <p>Create account</p>
                </Col>
                <Col>
                  <h1 className={classNames(style.numbers, 'font-weight-bold')}>2</h1>
                  <p>Integrate API</p>
                </Col>
                <Col>
                  <h1 className={classNames(style.numbers, 'font-weight-bold')}>3</h1>
                  <p>Set Custom Fee Rate</p>
                </Col>
                <Col>
                  <h1 className={classNames(style.numbers, 'font-weight-bold')}>4</h1>
                  <p>Earn BTC</p>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row style={{ backgroundColor: '#181818' }} className='m-0 mt-0 p-0'>
            <Col className={classNames(style.ctaContainer, 'mx-auto d-flex mb-5 mt-5 px-md-5 px-0 pl-xs-4 pl-md-5 pl-3 py-md-0 py-4')}>
              <Row style={{ flex: 1 }} className='mx-0 px-0 justify-content-between align-items-center'>
                <Col className='p-0 m-0 d-flex' xs='12' md='6'>
                  <h2 className='text-white my-0'>Ready to get started?</h2>
                </Col>
                <Col className='p-0 m-0 mt-xs-3 mt-md-0 mt-0 d-flex justify-content-xs-start justify-content-md-end' xs='12' md='6'>
                  <Button tag='a' href='#' className='text-white mr-3' color='primary'>Get in touch</Button>
                  <Button tag='a' href='https://api.faa.st' target='_blank' color='white'>Faa.st API Docs</Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </div>
      <Footer translations={translations} showEmail={false} />
    </div>
  )
})

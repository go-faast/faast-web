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

import supportImg from 'Img/supportColor.svg'
import chartImg from 'Img/chartColor.png'
import coinsImg from 'Img/coinsColor.png'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import style from './style.scss'

const features = [{
  heading: '1 - Monetization',
  description: 'Faa.st allows you to easily monetize your site or application by integrating our Faa.st API or Swap Widget into your product or service. This enables your users to instantly swap cryptos while you earn a percentage of every transaction.',
},
{
  heading: '2 - Simplicity',
  description: 'The team at Faa.st worked hard on simplifying the technical areas to allow quick and easy installations. So no matter your project, the Faa.st API contains simple commands that allow you to easily process and detail transactions.',
},
{
  heading: '3 - Customizable',
  description: 'Unlike other exchange services, Faa.st offers customizable fixed or marginal fees on transactions. This allows you to choose the right monetization model for your use case, and charge accordingly.',
},
{
  heading: '4 - Monitoring',
  description: 'Faa.st affiliates gain access to a built-in affiliate dashboard that allows you to track your earnings per transaction, monitor the swaps through integration, and withdraw your BTC payouts.',
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
                  target='_blank noreferrer'
                  href='https://api.faa.st'>
                    Check out the Faa.st API Docs
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
              {features.map((f,i) => (
                <Row key={i} className='mt-3'>
                  <Col md='6' className='text-left mx-auto'>
                    <h4 style={{ fontWeight: 600 }}>{f.heading}</h4> 
                    {f.description}
                  </Col>
                </Row>
              ))}
            </Col>
          </Row>
          <Row className='text-center py-5 px-4 mx-0'>
            <Col className='pb-5 px-0' xs='12'>
              <h1 style={{ fontWeight: 600 }}>Affiliate Features</h1>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='50' src={supportImg} />
                </Col>
                <Col>
                We provide full 24 hour support to answer any questions you may have
                </Col>
              </Row>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='50' src={chartImg} />
                </Col>
                <Col>
                Keep track of your completed swaps and earned fees with our affiliate dashboard
                </Col>
              </Row>
            </Col>
            <Col lg='4' md='12'>
              <Row>
                <Col className='mb-4' xs='12'>
                  <img width='50' src={coinsImg} />
                </Col>
                <Col>
                Initiate a BTC payout of your earned fees, in one click, directly from the affiliate dashboard
                </Col>
              </Row>
            </Col>
          </Row>
          {/* <Row className='text-center py-5 px-0 mx-0'>
            <Col className='px-0' xs='12'>
              <h2 className='pb-0 mb-0' style={{ fontWeight: 600 }}>Partners</h2>
            </Col>
            <Col className='px-0'>
              <Row className='d-flex align-items-center mx-0'>
                <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://s3-ap-southeast-1.amazonaws.com/cs-public-uploads-prod/131139e0-f4f7-4813-b119-ba6db0514de0?v=4638754' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='260' src='https://community.hackernoon.com/uploads/default/original/2X/3/34a9694703d85f7d590d4da3f5c5a0e88dc764dc.png' />
                </Col>
                <Col xs='12' md='6' lg='4'>
                  <img width='140' src='https://en.bitcoinwiki.org/upload/en/images/f/f9/Edge.png' />
                </Col>
              </Row>
            </Col>
          </Row> */}
          <Row style={{ backgroundColor: '#171717' }} className='m-0 mt-5 p-0'>
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

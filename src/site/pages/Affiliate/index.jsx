import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Row, Col } from 'reactstrap'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'
import EmailForm from 'Site/components/InlineEmailForm'

import Footer from 'Site/components/Footer'
import Hero from 'Site/components/Hero'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import SupportIcon from 'Img/affiliate-support.png'
import DashboardIcon from 'Img/affiliate-dashboard.png'
import PayoutIcon from 'Img/affiliate-payout.png'

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
      <div className='text-dark' style={{ backgroundColor: '#fff' }}>
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
              subline={<span>The Faa.st API makes multi-coin exchanges quick, easy, and profitable</span>}
              notification={<span>Check out the Faa.st API docs to get started</span>}
              notificationLink={'https://api.faa.st'}
              cta={<EmailForm /> }
              bgColor={'#323540'}
              bgImage={'https://i.imgur.com/CKbwoEu.png'}
              showMacScreenShot={false}
            />
          </div>
        </div>
        <Row className='text-center py-5 px-0 mx-0'>
          <Col xs='12'>
            <h1 style={{ fontWeight: 600 }}>Why Integrate with Faa.st?</h1>
          </Col>
          <Col className='mt-4' xs='12'>
            <Row className='mt-3'>
              <Col xs='5'>img 1</Col>
              <Col md='5' className='text-left'>
                <h4>Monetization</h4> 
                Faa.st allows you to easily monetize your site or application by integrating our Faa.st API or Swap Widget into your product or service. This enables your users to instantly swap cryptos while you earn a percentage of every transaction.
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col xs='5'>img 2</Col>
              <Col md='5' className='text-left'>
                <h4>Simplicity</h4>
                The team at Faa.st worked hard on simplifying the technical areas to allow quick and easy installations. So no matter your project, the Faa.st API contains simple commands that allow you to easily process and detail transactions.
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col xs='5'>img 3</Col>
              <Col md='5' className='text-left'>
                <h4>Customizable</h4>
                Unlike other exchange services, Faa.st offers customizable fixed or marginal fees on transactions. This allows you to choose the right monetization model for your use case, and charge accordingly.
              </Col>
            </Row>
            <Row className='mt-4'>
              <Col xs='5'>img 4</Col>
              <Col md='5' className='text-left'>
                <h4>Monitoring</h4>
                Faa.st affiliates gain access to a built-in affiliate dashboard that allows you to track your earnings per transaction, monitor the swaps through integration, and withdraw your BTC payouts.
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='text-center py-5 px-4 mx-0'>
          <Col className='pb-5 px-0' xs='12'>
            <h1 style={{ fontWeight: 600 }}>Affiliate Features</h1>
          </Col>
          <Col lg='4' md='12'>
            <Row>
              <Col className='mb-4' xs='12'>
                <img width='120' src={SupportIcon} />
              </Col>
              <Col>
                We provide full 24 hour support to answer any questions you may have
              </Col>
            </Row>
          </Col>
          <Col lg='4' md='12'>
            <Row>
              <Col className='mb-4' xs='12'>
                <img width='120' src={DashboardIcon} />
              </Col>
              <Col>
                Keep track of your completed swaps and earned fees with our affiliate dashboard
              </Col>
            </Row>
          </Col>
          <Col lg='4' md='12'>
            <Row>
              <Col className='mb-4' xs='12'>
                <img width='120' src={PayoutIcon} />
              </Col>
              <Col>
                Initiate a BTC payout of your earned fees, in one click, directly from the affiliate dashboard
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className='text-center py-5 px-0 mx-0'>
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
        </Row>
      </div>
      <Footer translations={translations} />
    </div>
  )
})

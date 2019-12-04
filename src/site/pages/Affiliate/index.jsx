import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Button, Row, Col } from 'reactstrap'
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
            <Row>
              <Col xs='5'>img 1</Col>
              <Col>This is reason 1 explanation</Col>
            </Row>
            <Row>
              <Col xs='5'>img 2</Col>
              <Col>This is reason 2 explanation</Col>
            </Row>
            <Row>
              <Col xs='5'>img 3</Col>
              <Col>This is reason 3 explanation</Col>
            </Row>
            <Row>
              <Col xs='5'>img 4</Col>
              <Col>This is reason 4 explanation</Col>
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

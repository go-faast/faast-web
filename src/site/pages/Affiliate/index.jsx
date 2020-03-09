import { pick } from 'lodash'
import * as React from 'react'
import { connect } from 'react-redux'
import { Row, Col, Button, Container } from 'reactstrap'
import { withRouteData } from 'react-static'
import { createStructuredSelector } from 'reselect'
import classNames from 'class-names'
import { compose, setDisplayName, lifecycle, withProps } from 'recompose'
import withTracker from 'Site/components/withTracker'
import AffiliateContact from 'Site/components/AffiliateContact'
import Terminal from 'Site/components/Terminal'

import Footer from 'Site/components/Footer'
import Hero from 'Site/components/Hero'

import bitcoin from 'Img/bitcoinAffiliate.svg'
import edge from 'Img/edgeLogo.svg'
import monitor from 'Img/monitor.svg'
import adjust from 'Img/adjust.svg'
import code from 'Img/code.svg'
import dashboard from 'Img/afilDashboard.png'

import { fetchGeoRestrictions } from 'Common/actions/app'
import { retrieveAssets } from 'Common/actions/asset'
import { getAllAssetsArray, areAssetsLoaded } from 'Common/selectors/asset'

import style from './style.scss'

const features = [
  {
    icon: monitor,
    heading: 'Swap Functionality',
    description: 'Integrating Faa.st into your website or application grants you out of the box crypto to crypto trading functionality. Facilitate transactions and empower users on top of your own platform, without requiring any of the complex infrastructure.',
  },
  {
    icon: bitcoin,
    heading: 'Easy Monetization',
    description: 'Easily monetize your product using a referral link or by integrating our API directly. Enable your users to instantly swap crypto and you’ll earn a percentage on every swap paid in Bitcoin.',
  },
  {
    icon: code,
    heading: 'Simple Integration',
    description: 'Our team worked hard on simplifying the technical areas to allow quick and easy setup. So no matter your project, our affiliate program will allow you to quickly start profiting.',
  },
  {
    icon: adjust,
    heading: 'Customizable',
    description: 'Unlike other exchange services, we allow you to choose the fixed and percent fees applied to swaps. This allows you to choose the right monetization model for your use case, and charge accordingly.',
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
                  Become a Partner and Start Earning Bitcoin
                </h1>
              )}
              rightHero={<AffiliateContact />}
              subline={<span>The Faa.st affiliate program makes monetizing your product quick, easy, and profitable</span>}
              cta={(
                <Button 
                  tag='a' 
                  className='btn btn-primary btn-lg hero-button py-2' 
                  color='primary'
                  role='button' 
                  href='https://faa.st/app/affiliates/signup'>
                    Start earning now
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
          <Container>
            <Row className={classNames(style.whyUseFast, 'text-center mt-xs-5 mt-lg-0 py-5 px-0 mx-2 justify-content-center')}>
              <Col xs='12'>
                <h1 className='mb-4 mt-xs-5 mt-lg-3 mt-0 pt-xs-5 pt-lg-0 pt-0' style={{ fontWeight: 600 }}>Why Integrate with Faa.st?</h1>
              </Col>
              <Col xs='12' className='mb-4'>
                <h4 style={{ color: '#657586', lineHeight: 1.4, }}>Integrating Faa.st into your website or application grants you out of the box crypto to crypto trading functionality. This enables you to facilitate transactions and empower users on top of your own platform, without requiring any of the complex infrastructure!</h4>
              </Col>
              <Col className='mt-4' xs='12'>
                <Row className='mt-3 justify-content-center'>
                  {features.map((f,i) => (
                    <Col style={{ borderRadius: 4, boxShadow: 'rgba(200, 216, 236, 0.5) 0px 5px 11px 1px' }} key={i} xs='12' md='5' className='text-left mb-4 px-3 py-4 mr-4'>
                      <h2 style={{ fontWeight: 600 }}>
                        <img className='mr-2' width='38' height='38' src={f.icon} /> {f.heading}
                      </h2> 
                      <p className='mt-3' style={{ lineHeight: 1.7, color: '#657586', fontSize: 18 }}>{f.description}</p>
                    </Col>
                  ))}
                </Row>
              </Col>
            </Row>
            <Row className='text-center py-5 px-4 mx-0 mb-5 justify-content-center'>
              <Col className='pb-4 px-0 mb-3' xs='12'>
                <h2 style={{ fontWeight: 600 }}>Dashboard Features</h2>
              </Col>
              <Col className='mb-5 pb-2 justify-content-center d-flex align-items-center' xs='6'>
                <img style={{ boxShadow: '0px 5px 11px 1px rgba(200, 216, 236, 0.5)', borderRadius: 4, maxWidth: 500, width: '100vw' }} src={dashboard} />
              </Col>
              <Col lg='4' md='6' className='text-left ml-xs-0 ml-lg-4'>
                <Row>
                  <Col style={{ fontSize: 20 }} className='mt-4'>
                    <i style={{ color: '#00C7B6' }} className='fa fa-check-circle mr-2'></i> Visualize what assets your users are swapping and track your earnings in one easy to use interface
                  </Col>
                </Row>
                <Row style={{ fontSize: 20 }} className='mt-4'>
                  <Col>
                    <i style={{ color: '#00C7B6' }} className='fa fa-check-circle mr-2'></i> Initiate a payout in one click, whenever you want
                  </Col>
                </Row>
                <Row style={{ fontSize: 20 }} className='mt-4'>
                  <Col>
                    <i style={{ color: '#00C7B6' }} className='fa fa-check-circle mr-2'></i> Full 24/7 phone and email support from real human beings
                  </Col>
                </Row>
              </Col>
            </Row>
          </Container>
          <Row style={{ backgroundColor: '#F6FAFE' }} className='text-center pt-5 pb-2 px-0 mx-0'>
            <Container>
              <Col className='px-0' xs='12'>
                <h2 className='pb-0 mb-3' style={{ fontWeight: 600 }}>Join our partners</h2>
                <h5 style={{ opacity: .75 }}>These affiliates are already earning with Faa.st</h5>
              </Col>
              <Col className='px-0'>
                <Row className='d-flex align-items-center justify-content-center mx-0 m-5'>
                  <Col className='mb-xs-4 mb-lg-0' xs='12' md='6' lg='4'>
                    <a href='https://exodus.io' target='_blank noreferrer'>
                      <img width='140' src='https://s3-ap-southeast-1.amazonaws.com/cs-public-uploads-prod/131139e0-f4f7-4813-b119-ba6db0514de0?v=4638754' />
                    </a>
                  </Col>
                  <Col className='mb-xs-4 mb-lg-0' xs='12' md='6' lg='4'>
                    <a href='https://emberfund.io' target='_blank noreferrer'>
                      <img width='260' src='https://www.emberfund.io/images/logo-horizontal.svg' />
                    </a>
                  </Col>
                  <Col className='mb-xs-4 mb-lg-0' xs='12' md='6' lg='4'>
                    <a href='https://edge.app' target='_blank noreferrer'>
                      <img width='140' src={edge} />
                    </a>
                  </Col>
                </Row>
              </Col>
            </Container>
          </Row>
          <Row className='pt-5 pb-2 px-0 mx-0 mt-5 mb-5 pb-5'>
            <Container>
              <Col className='text-center'>
                <h2 style={{ fontWeight: 600 }}>How you can monetize</h2>
              </Col>
              <Col className='text-center mt-5 mb-4'>
                <h1 className={classNames(style.numbersGreen, 'font-weight-bold')}>1</h1>
                <span className='ml-2' style={{ fontWeight: 600, fontSize: 40 }}>API</span>
              </Col>
              <Col className='text-center'>
                <p style={{ fontSize: 18 }}>The most feature rich and customizable way to monetize your product. Provide swap support right in your website or app and choose the fee you’ll earn on each transaction. Sign up now to begin, or check out our getting started guide for more resources.</p>
                <Terminal theme='light' translations={translations} includeCopy={false} includeBg={false} />
              </Col>
              <Col className='text-center mt-0 mb-4'>
                <h1 className={classNames(style.numbersGreen, 'font-weight-bold')}>2</h1>
                <span className='ml-2' style={{ fontWeight: 600, fontSize: 40 }}>Referral Links</span>
              </Col>
              <Col className='text-center'>
                <p className='mb-5' style={{ fontSize: 18 }}>The easiest way to get started. Simply present your users with a special referral link to the Faa.st website and you’ll earn a percentage on each swap they place. Sign up now to get your link.</p>
                <div className={style.input}>
                  <p>https://faa.st/swap?aid=YOUR_AID_HERE <i className='fa fa-copy'></i></p>
                </div>
              </Col>
              <Col className='text-center mt-5'>
                <Button tag='a' href='/app/affiliates/signup' className='text-white mr-3' color='primary'>Get started</Button> 
              </Col>
            </Container>
          </Row>
          <Row className='text-center py-5 mx-0 mt-5 text-white' style={{ backgroundColor: '#374B5D' }}>
            <Container>
              <Col className='mb-5' xs='12'>
                <h2 style={{ fontWeight: 600 }}>How to set up</h2>
              </Col>
              <Col xs='12'>
                <Row>
                  <Col>
                    <h1 className={classNames(style.numbers, 'font-weight-bold')}>1</h1>
                    <p>Sign up <a href='/app/affiliates/signup'>here</a></p>
                  </Col>
                  <Col className='align-items-center justify-content-center d-flex' xs='1'>
                    <svg viewBox="0 0 129 129" enableBackground="new 0 0 129 129" width="24px" height="24px">
                      <g>
                        <path className="steps-arrow-fill" d="m40.4,121.3c-0.8,0.8-1.8,1.2-2.9,1.2s-2.1-0.4-2.9-1.2c-1.6-1.6-1.6-4.2 0-5.8l51-51-51-51c-1.6-1.6-1.6-4.2 0-5.8 1.6-1.6 4.2-1.6 5.8,0l53.9,53.9c1.6,1.6 1.6,4.2 0,5.8l-53.9,53.9z" fill="#fff"/>
                      </g>
                    </svg>
                  </Col>
                  <Col>
                    <h1 className={classNames(style.numbers, 'font-weight-bold')}>2</h1>
                    <p>Integrate Faa.st</p>
                  </Col>
                  <Col className='align-items-center justify-content-center d-flex' xs='1'>
                    <svg viewBox="0 0 129 129" enableBackground="new 0 0 129 129" width="24px" height="24px">
                      <g>
                        <path className="steps-arrow-fill" d="m40.4,121.3c-0.8,0.8-1.8,1.2-2.9,1.2s-2.1-0.4-2.9-1.2c-1.6-1.6-1.6-4.2 0-5.8l51-51-51-51c-1.6-1.6-1.6-4.2 0-5.8 1.6-1.6 4.2-1.6 5.8,0l53.9,53.9c1.6,1.6 1.6,4.2 0,5.8l-53.9,53.9z" fill="#fff"/>
                      </g>
                    </svg>
                  </Col>
                  <Col>
                    <h1 className={classNames(style.numbers, 'font-weight-bold')}>3</h1>
                    <p>Earn BTC</p>
                  </Col>
                </Row>
              </Col>
            </Container>
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

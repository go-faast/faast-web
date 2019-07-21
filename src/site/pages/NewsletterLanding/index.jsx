/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import withTracker from 'Site/components/withTracker'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import { Row, Col } from 'reactstrap'

import classNames from 'class-names'

import BitcoinLogo from 'Img/newsletter-btc.svg'
import EthereumLogo from 'Img/newsletter-eth.svg'
import LitecoinLogo from 'Img/newsletter-ltc.svg'

import { hero, eth, ltc, btc, dashedLine, line } from './style.scss'

export default compose(
  setDisplayName('NewsletterLanding'),
  withTracker,
  withRouteData,
)(({ translations }) => (
  <Fragment>
    <div className={hero}>
      <div className='position-relative' style={{ zIndex: 9999 }}>
        <Header translations={translations} headerColor={'transparent'} />
      </div>
      <div className='position-absolute' style={{ top: 68, right: '45%' }}>
        <div className={classNames(eth, line)}>
          <img src={EthereumLogo} style={{ width: 91, height: 93 }} />
        </div>
        <div className={classNames(ltc, line)}>
          <img src={LitecoinLogo} style={{ width: 81, height: 82 }} />
        </div>
        <div className={classNames(btc, line)}>
          <img src={BitcoinLogo} style={{ width: 71, height: 72 }} />
        </div>
        <div className={dashedLine}></div>
      </div>
      <Row className='p-0 m-0 position-relative' style={{ zIndex: 999 }}>
        <Col className='pl-5' sm='6'>
          <div className='pl-3'>
            <h1 style={{ fontWeight: 600 }} className='mt-5 pt-5'>Keep up with the Faa.st Newsletter</h1>
            <h5 className='mt-4' style={{ color: '#B6AFDC', fontSize: 16 }}>
            Stay up-to-date on all that is happening with Faa.st including adding new assets, new features, cryptocurrency news, and more!
            </h5>
          </div>
        </Col>
        <Col sm='6' className='p-0'>
        </Col>
      </Row>
    </div>
    <Footer translations={translations} showEmail={false} />
  </Fragment>
))

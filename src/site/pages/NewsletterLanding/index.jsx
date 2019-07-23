/* eslint-disable react/no-unescaped-entities */
import React, { Fragment } from 'react'
import { compose, setDisplayName } from 'recompose'
import { withRouteData } from 'react-static'
import Icon from 'Components/Icon'
import withTracker from 'Site/components/withTracker'
import Header from 'Site/components/Header'
import Footer from 'Site/components/Footer'
import EmailForm from 'Site/components/InlineEmailForm'
import { Row, Col } from 'reactstrap'

import classNames from 'class-names'

import BitcoinLogo from 'Img/newsletter-btc.svg'
import EthereumLogo from 'Img/newsletter-eth.svg'
import LitecoinLogo from 'Img/newsletter-ltc.svg'

import SwapIcon from 'Img/swap-icon.svg'

import { hero, eth, ltc, btc, dashedLine, line, circle, swapIcon, icon, coinContainer, dashedLineBlue } from './style.scss'

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
      <div className={coinContainer}>
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
        <div className={dashedLineBlue}></div>
      </div>
      <Row className='p-0 m-0 position-relative' style={{ zIndex: 999 }}>
        <Col className='pl-md-5 pl-0 mt-4' sm='7'>
          <div className='pl-3'>
            <h1 style={{ fontWeight: 600, fontSize: 37 }} className='mt-5 pt-5'>Keep up with the Faa.st Newsletter</h1>
            <h5 className='mt-4' style={{ color: '#B6AFDC', fontSize: 16 }}>
            Stay up-to-date on all that is happening with Faa.st including adding new assets, new features, cryptocurrency news, and more!
            </h5>
            <div style={{ maxWidth: 505, overflow: 'hidden' }} className='mt-4 pt-1'>
              <EmailForm />
            </div>
            <div className='position-relative' style={{ top: -80 }}>
              <div className={circle}>
                <Row className='align-content-center'>
                  <Col xs='12'>
                    <i className={classNames(icon, 'fa fa-lock')}></i>
                  </Col>
                  <Col xs='12'>
                    <small>secure</small>
                  </Col>
                </Row>
              </div>
              <div className={classNames('ml-2', circle)}>
                <Row className='align-content-center'>
                  <Col xs='12'>
                    <i className={classNames(icon, 'fa fa-rocket')}></i>
                  </Col>
                  <Col xs='12'>
                    <small>fast</small>
                  </Col>
                </Row>
              </div>
              <div className={classNames('ml-2', circle)}>
                <Row className='align-content-center'>
                  <Col xs='12'>
                    <Icon src={SwapIcon} className={classNames(icon, swapIcon)} height={20} width={20} color='#fff' />
                  </Col>
                  <Col xs='12'>
                    <small>swap</small>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        </Col>
        <Col className='p-0' sm='2'>
        </Col>
      </Row>
    </div>
    <Footer translations={translations} showEmail={false} />
  </Fragment>
))

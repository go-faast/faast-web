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
)(({ translations, translations: { static: { newsletter: t } } }) => (
  <Fragment>
    <div 
      className='position-fixed d-md-none d-block' 
      style={{ top: 0, left: 0, width: '100%', height: '100%', backgroundColor: 'rgba(0,0,0,.3)', zIndex: 1 }}>
    </div>
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
      <Row className='p-0 m-0 mx-auto position-relative' style={{ zIndex: 999, maxWidth: 1400 }}>
        <Col className='pl-md-5 pl-0' xs='12' md='10' lg='7'>
          <div className='pl-3'>
            <h1 style={{ fontWeight: 600, fontSize: 37 }} className='mt-md-5 mt-2 pt-5'>
              {t.keepUp}
            </h1>
            <h5 className='mt-4' style={{ color: '#B6AFDC', fontSize: 16 }}>
              {t.subscribeNow}
              <ul style={{ listStyleType: 'circle' }} className='pl-3 mt-3'>
                <li>{t.assetListings}</li>
                <li>{t.exclusiveOffers}</li>
                <li>{t.report}</li>
              </ul>
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
                    <small>{t.secure}</small>
                  </Col>
                </Row>
              </div>
              <div className={classNames('ml-2', circle)}>
                <Row className='align-content-center'>
                  <Col xs='12'>
                    <i className={classNames(icon, 'fa fa-rocket')}></i>
                  </Col>
                  <Col xs='12'>
                    <small>{t.fast}</small>
                  </Col>
                </Row>
              </div>
              <div className={classNames('ml-2', circle)}>
                <Row className='align-content-center'>
                  <Col xs='12'>
                    <Icon src={SwapIcon} className={classNames(icon, swapIcon)} height={20} width={20} color='#fff' />
                  </Col>
                  <Col xs='12'>
                    <small>{t.swap}</small>
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

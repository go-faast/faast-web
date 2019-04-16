import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container, Row, Col } from 'reactstrap'

import Header from 'Site/components/Header'
import SwapWidget from 'Site/components/SwapWidget'

import T from 'Components/i18n/T'

import MoonBackground from 'Img/moon-background.jpg'

import PropTypes from 'prop-types'
import classNames from 'class-names'

export default compose(
  setDisplayName('Hero'),
  setPropTypes({
    to: PropTypes.string,
    from: PropTypes.string,
    headline: PropTypes.node,
    supportedAssets: PropTypes.arrayOf(PropTypes.object),
    showMacScreenShot: PropTypes.bool
  }),
  defaultProps({
    to: 'ETH',
    from: 'BTC',
    supportedAssets: [{}],
    headline: (
      <T tag='h1' i18nKey='static.home.heroTitle' className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
        <span className='special-word'>Instantly</span> trade directly from your Ledger, Trezor, or MetaMask.
      </T>
    ),
    showMacScreenShot: true
  }),
)(({ supportedAssets, to, from, headline }) => (
  <div>
    <Header/>
    <div className='jumbotron jumbotron-fluid hero-technology mb-0' style={{
      backgroundImage: `url(${MoonBackground})`,
      height: '824px',
      backgroundPosition: '50% 25px',
      backgroundSize: '1400px',
      backgroundRepeat: 'no-repeat',
      marginTop: '-225px',
      paddingTop: '285px',
      backgroundColor: 'rgba(0,26,23)',
    }}>
      <Container>
        <Row>
          <Col sm='12' lg='6' className='text-left pl-md-5 pl-0 ml-4'>
            <a href='/market-maker'>
              <div className='notification mt-md-4 mt-0 mb-4'>
                <span className='new-pill'>new</span>
            Read about the Faa.st Market Maker Beta
              </div>
            </a>
            {headline}
            <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal' }}>
            The <span className='special-word'>safest</span> way to to build a diversified cryptocurrency portfolio
            </p>
            <p><a className='btn btn-primary btn-lg hero-button py-2' role='button' href='/app'>
      Create A Portfolio
            </a></p>
          </Col>
          <Col className={classNames('pr-3 d-block')}>
            <SwapWidget assets={supportedAssets} defaultDeposit={from} defaultReceive={to} />
          </Col>
        </Row>
      </Container>
    </div>
  </div>
))
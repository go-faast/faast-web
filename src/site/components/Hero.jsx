import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container, Row, Col } from 'reactstrap'

import Header from 'Site/components/Header'
import SwapWidget from 'Site/components/SwapWidget'

import MoonBackground from 'Img/moon-background.jpg'
import MacbookScreenshot1 from 'Img/macbook-screenshot-01.png'

import PropTypes from 'prop-types'
import classNames from 'class-names'
import LazyLoad from 'react-lazyload'

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
      <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
        <span className='special-word'>Instantly</span> trade directly from your Ledger, Trezor, or MetaMask.
      </h1>
    ),
    showMacScreenShot: true
  }),
)(({ supportedAssets, to, from, headline, showMacScreenShot }) => (
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
            {headline}
            <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal' }}>
            The <span className='special-word'>safest</span> way to to build a diversified cryptocurrency portfolio
            </p>
            <p><a className='btn btn-primary btn-lg hero-button py-2' role='button' href='/app'>
      Create A Portfolio
            </a></p>
          </Col>
          <Col className={classNames(!showMacScreenShot ? 'd-lg-block' : 'd-md-block','pr-3 d-none')}>
            <SwapWidget assets={supportedAssets} defaultDeposit={from} defaultReceive={to} />
          </Col>
          {showMacScreenShot && (
            <div className='intro d-md-none d-block mx-auto' style={{ paddingTop: '60px', maxWidth: 400 }}>
              <LazyLoad offset={200} height={200}>
                <img className='img-fluid' src={MacbookScreenshot1} style={{ height: '100%', width: '730px' }}/>	
              </LazyLoad>
            </div>
          )}
        </Row>
      </Container>
    </div>
  </div>
))
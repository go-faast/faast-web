import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container, Row, Col } from 'reactstrap'

import Header from 'Site/components/Header'
import SwapWidget from 'Site/components/SwapWidget'

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
    showMacScreenShot: PropTypes.bool,
    translations: PropTypes.object
  }),
  defaultProps({
    to: 'ETH',
    from: 'BTC',
    supportedAssets: [{}],
    showMacScreenShot: true
  }),
)(({ supportedAssets, to, from, headline, translations = {}, translations: { static: { hero = {}, hero: { headline: headlineT = {}, subtitle = {} } = {} } = {} } }) => (
  <div>
    <Header translations={translations}/>
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
                <span className='new-pill'>{hero.new}</span>
                {hero.notification}
              </div>
            </a>
            {headline || (
              <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
                <span className='special-word'>Instantly</span> Trade 70+ Coins from your Hardware or Software Wallet.
              </h1>
            )}
            <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal' }}>
             Simply connect your wallet, and <span className='special-word'>safely</span> begin building a diversified portfolio.
            </p>
            <p><a className='btn btn-primary btn-lg hero-button py-2' role='button' href='/app/connect'>
              {hero.button}
            </a></p>
          </Col>
          <Col className={classNames('pr-3 d-block')}>
            <SwapWidget assets={supportedAssets} defaultDeposit={from} defaultReceive={to} translations={translations} />
          </Col>
        </Row>
      </Container>
    </div>
  </div>
))
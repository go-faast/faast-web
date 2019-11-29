import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Container, Row, Col } from 'reactstrap'

import Header from 'Site/components/Header'
import SwapWidget from 'Site/components/SwapWidget'
import LangLink from 'Components/LangLink'
import GAEventButton from 'Components/GAEventButton'

import MoonBackground from 'Img/moon-background.jpg'

import PropTypes from 'prop-types'
import classNames from 'class-names'

export default compose(
  setDisplayName('Hero'),
  setPropTypes({
    to: PropTypes.string,
    from: PropTypes.string,
    headline: PropTypes.node,
    subline: PropTypes.node,
    supportedAssets: PropTypes.arrayOf(PropTypes.object),
    showMacScreenShot: PropTypes.bool,
    translations: PropTypes.object,
    notification: PropTypes.node,
    notificationLink: PropTypes.node,
    cta: PropTypes.node,
    backgroundImage: PropTypes.string
  }),
  defaultProps({
    to: 'ETH',
    from: 'BTC',
    supportedAssets: [{}],
    showMacScreenShot: true,
    subline: undefined,
    notification: undefined,
    notificationLink: undefined,
    cta: undefined,
    backgroundImage: undefined
  }),
)(({ supportedAssets, to, from, headline, subline, notification, 
  notificationLink, translations = {}, cta, bgImage, bgColor,
  translations: { static: { hero = {}, hero: { headline: headlineT = {}, subtitle = {} } = {} } = {} } }) => (
  <div>
    <Header translations={translations} />
    <div className='jumbotron jumbotron-fluid hero-technology mb-0' style={{
      backgroundImage: bgImage ? bgImage : `url(${MoonBackground})`,
      height: '824px',
      backgroundPosition: '50% 25px',
      backgroundSize: '1400px',
      backgroundRepeat: 'no-repeat',
      marginTop: '-225px',
      paddingTop: '285px',
      backgroundColor: bgColor ? bgColor : 'rgba(0,26,23)',
    }}>
      <Container>
        <Row>
          <Col sm='12' lg='6' className='text-left pl-md-5 pl-0 ml-4'>
            <LangLink style={{ textDecoration: 'none' }} to={notificationLink ? notificationLink : '/market-maker'}>
              <div className='notification mt-md-4 mt-0 mb-4'>
                <span className='new-pill'>{hero.new}</span>
                {notification ? notification : hero.notification}
              </div>
            </LangLink>
            {headline || (
              <h1 className='hero-title mb-4' style={{ fontWeight: 'normal' }}>
                {headlineT.goxxed}
              </h1>
            )}
            <p className='hero-subtitle mb-4' style={{ fontWeight: 'normal' }}>
              {subline ? subline : subtitle.notYourKeys}
            </p>
            <p>
              {cta ? cta : (
                <GAEventButton 
                  tag='a' 
                  event={{ category: 'Static', action: 'Go to Connect' }} 
                  className='btn btn-primary btn-lg hero-button py-2' 
                  color='primary'
                  role='button' 
                  href='/app/connect'
                >
                  {hero.button}
                </GAEventButton>
              )}
            </p>
          </Col>
          <Col className={classNames('pr-3 d-block')}>
            <SwapWidget assets={supportedAssets} defaultDeposit={from} defaultReceive={to} translations={translations} />
          </Col>
        </Row>
      </Container>
    </div>
  </div>
))
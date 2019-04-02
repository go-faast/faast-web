import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col } from 'reactstrap'
import siteConfig from 'Site/config'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import { betaTag } from './Header/style.scss'

export default compose(
  setDisplayName('Footer'),
  setPropTypes({
    footerClass: PropTypes.string
  }),
  defaultProps({
    footerClass: ''
  }),
)(({ footerClass }) => (
  <div className='footer-clean' style={{ backgroundColor: 'rgb(24,24,24)', paddingTop: '0px', height: '394px' }}>
    <footer>
      <div className={classNames('container', footerClass)} style={{ paddingTop: '40px' }}>
        <div className='row no-gutters'>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item px-3'>
            <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Faa.st</h3>
            <ul>
              <li><a className='text-white' href='https://bitaccess.ca/about-us/' target='_blank noopener noreferrer'>About Us</a></li>
              <li><a className='text-white' href='/affiliates'>Affiliate Program</a></li>
              <li><a className='text-white font-xs' href='/app'>Portfolio</a></li>
              <li><a className='text-white' href='/app/swap'>Swap</a></li>
              <li><a className='text-white' href='/market-maker'>Market Maker <sup className={classNames(betaTag, 'text-primary')}><i>beta</i></sup></a></li>
              <li><a className='text-white' href='/blog'>Blog</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
            <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Assets</h3>
            <ul>
              <li><a className='text-white' href='/app/assets'>Market Cap Rankings</a></li>
              <li><a className='text-white' href='/app/assets/trending'>Trending</a></li>
              <li><a className='text-white' href='/app/assets/watchlist'>Watchlist</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
            <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Wallets</h3>
            <ul>
              <li><a className='text-white' href='/wallets/trezor'>Trezor</a></li>
              <li><a className='text-white' href='/wallets/ledger-wallet'>Ledger</a></li>
              <li><a className='text-white' href='/wallets/metamask'>MetaMask</a></li>
              <li><a className='text-white' href='/wallets/mist-browser'>Mist Browser</a></li>
              <li><a className='text-white' href='/wallets/trust-wallet'>Trust Wallet</a></li>
              <li><a className='text-white' href='/wallets/coinbase-wallet'>Coinbase Wallet</a></li>
              <li><a className='text-white' href='/wallets/status'>Status</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-0'>
            <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Knowledge</h3>
            <ul>
              <li><a className='text-white' href='/what-is-an-ico'>What is an ICO?</a></li>
              <li><a className='text-white' href='/what-are-smart-contracts'>What are smart contracts?</a></li>
              <li><a className='text-white' href='/what-is-a-dao'>What is a DAO?</a></li>
              <li><a className='text-white' href='/what-is-ethereum'>What is Ethereum?</a></li>
              <li><a className='text-white' href='/what-is-the-difference-between-ico-ipo-ito'>ICO, IPO, and ITO</a></li>
              <li><a className='text-white' href='/how-to-buy-ethereum'>How to buy Ethereum</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
            <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Resources</h3>
            <ul>
              <li><a href='https://api.faa.st/' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>API</a></li>
              <li><a href='/static/faast-press-kit.zip' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>Press Kit</a></li>
            </ul>
          </div>
        </div>
        <Row className='py-4 mt-5' style={{ borderTop: '1px solid #333' }}>
          <Col className='item social text-white text-left'>
            <ul className='mt-4'>
              <li className='d-inline-block mr-4'><a href='mailto:support@faa.st' style={{ color: 'rgb(255,255,255)' }}>support@faa.st</a></li>
              <li className='d-inline-block mr-4'><a className='text-white' href='/terms' target='_blank noopener noreferrer'>Terms of use</a></li>
              <li className='d-inline-block'><a className='text-white' href='/privacy' target='_blank noopener noreferrer'>Privacy Policy</a></li>
            </ul>
          </Col>
          <Col className='item social text-white'>
            <a href='https://github.com/go-faast' target='_blank noopener noreferrer'><i className='icon ion-social-github'></i></a>
            <a href='https://www.facebook.com/Faast-237787136707810' target='_blank noopener noreferrer'><i className='icon ion-social-facebook'></i></a>
            <a href='https://twitter.com/gofaast' target='_blank noopener noreferrer'><i className='icon ion-social-twitter'></i></a>
            <a href='https://slack.faa.st/' target='_blank noopener noreferrer'><i className='fab fa-slack-hash'></i></a>
            <a href='https://www.reddit.com/r/gofaast/' target='_blank noopener noreferrer'><i className='icon ion-social-reddit'></i></a>
            <p className='lead text-white copyright'>© {siteConfig.year} {siteConfig.author}</p>
          </Col>
        </Row>
      </div>
    </footer>
  </div>
))
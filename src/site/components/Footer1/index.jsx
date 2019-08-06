import React, { Fragment } from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Row, Col, Button } from 'reactstrap'
import siteConfig from 'Site/config'
import classNames from 'class-names'
import PropTypes from 'prop-types'

import { betaTag } from '../Header/style.scss'

import FooterChart from 'Img/footer-chart.svg'
import LangLink from 'Components/LangLink'
import EmailSub from 'Site/components/EmailSubscription1'

import style from './style.scss'

export default compose(
  setDisplayName('Footer'),
  setPropTypes({
    footerClass: PropTypes.string,
  }),
  defaultProps({
    footerClass: '',
  }),
)(({ footerClass, translations: { static: { footer: t = {} } = {} } }) => (
  <Fragment>
    <div className='footer-clean position-relative' style={{ backgroundColor: '#191A1D', paddingTop: '0px', marginTop: 320 }}>
      <div style={{ top: -150 }} className='position-absolute'>
        <img style={{ width: '100vw', height: 260 }} src={FooterChart} />
      </div>
      <Row className='p-0 m-0'>
        <Col><EmailSub /></Col>
      </Row>
      <Row className='m-0 p-0 pt-5'>
        <Col className={classNames(style.ctaContainer, 'mx-auto d-flex justify-content-between align-items-center px-5 mb-5')}>
          <div>
            <h4 style={{ fontSize: 30 }} className='text-white my-0'>Ready to Trade on Faa.st?</h4>
          </div>
          <div>
            <Button className='text-white mr-3' color='primary'>Connect Your Wallet</Button>
            <Button color='white'>API Docs</Button>
          </div>
        </Col>
      </Row>
      <footer>
        <div className={classNames('container', footerClass)} style={{ paddingTop: '40px' }}>
          <div className='row no-gutters'>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>Faa.st</h3>
              <ul>
                <li><a className='text-white' href='https://bitaccess.ca/about-us/' target='_blank noopener noreferrer'>{t.aboutUs}</a></li>
                <li><a className='text-white' href='/affiliates'>{t.affiliate}</a></li>
                <li><a className='text-white font-xs' href='/app'>{t.portfolio}</a></li>
                <li><a className='text-white' href='/app/swap'>{t.swap}</a></li>
                <li><LangLink className='text-white' to='/market-maker'>{t.marketMaker} <sup className={classNames(betaTag, 'text-primary')}><i>{t.beta}</i></sup></LangLink></li>
                <li><a className='text-white' href='/blog'>{t.blog}</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.assets}</h3>
              <ul>
                <li><a className='text-white' href='/assets'>Supported Assets</a></li>
                <li><a className='text-white' href='/app/assets'>{t.marketCap}</a></li>
                <li><a className='text-white' href='/app/assets/trending'>{t.trending}</a></li>
                <li><a className='text-white' href='/app/assets/watchlist'>{t.watchlist}</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.wallets}</h3>
              <ul>
                <li><LangLink className='text-white' to='/wallets/trezor'>{t.trezor}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/ledger-wallet'>{t.ledger}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/metamask'>{t.metaMask}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/mist-browser'>{t.mistBrowser}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/trust-wallet'>{t.trustWallet}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/coinbase-wallet'>{t.coinbaseWallet}</LangLink></li>
                <li><LangLink className='text-white' to='/wallets/status'>{t.status}</LangLink></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-0'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.knowledge}</h3>
              <ul>
                <li><a className='text-white' href='/what-is-an-ico'>{t.whatIsIco}</a></li>
                <li><a className='text-white' href='/what-are-smart-contracts'>{t.smartContracts}</a></li>
                <li><a className='text-white' href='/what-is-a-dao'>{t.dao}</a></li>
                <li><a className='text-white' href='/what-is-ethereum'>{t.whatIsEth}</a></li>
                <li><a className='text-white' href='/what-is-the-difference-between-ico-ipo-ito'>{t.icoIpoIto}</a></li>
                <li><a className='text-white' href='/how-to-buy-ethereum'>{t.buyEthereum}</a></li>
              </ul>
            </div>
            <div className='col-6 col-sm-6 col-md-2 col-xl-2 item px-3'>
              <h3 className='text-white mb-4' style={{ fontWeight: 'normal', fontSize: 20 }}>{t.resources}</h3>
              <ul>
                <li><a href='https://api.faa.st/' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>{t.api}</a></li>
                <li><a href='/static/faast-press-kit.zip' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>{t.pressKit}</a></li>
              </ul>
            </div>
          </div>
          <Row className='py-4 mt-5'>
            <Col className='item social text-white text-left'>
              <ul className='mt-4'>
                <li className='d-inline-block mr-4'><a href='mailto:support@faa.st' style={{ color: 'rgb(255,255,255)' }}>support@faa.st</a></li>
                <li className='d-inline-block mr-4'><a className='text-white' href='/terms' target='_blank noopener noreferrer'>{t.terms}</a></li>
                <li className='d-inline-block'><a className='text-white' href='/privacy' target='_blank noopener noreferrer'>{t.privacy}</a></li>
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
  </Fragment>
))
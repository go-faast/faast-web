import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import siteConfig from 'Site/config'
import classNames from 'class-names'
import PropTypes from 'prop-types'

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
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-xl-1 item'>
            <h3 style={{ fontWeight: 'normal', color: '#00d7b8' }}>Faast</h3>
            <ul>
              <li><a className='text-white' href='/app' target='_blank noopener noreferrer'>Portfolio</a></li>
              <li><a className='text-white' href='/app/swap' target='_blank noopener noreferrer'>Swap</a></li>
              <li><a className='text-white' href='https://medium.com/faast' target='_blank noopener noreferrer'>Blog</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item'>
            <h3 style={{ fontWeight: 'normal', color: 'rgb(251,181,18)' }}>Bitaccess</h3>
            <ul>
              <li><a className='text-white' href='https://bitaccess.ca/about-us/' target='_blank noopener noreferrer'>About Us</a></li>
              <li><a className='text-white' href='/terms' target='_blank noopener noreferrer'>Terms of use</a></li>
              <li><a className='text-white' href='/privacy' target='_blank noopener noreferrer'>Privacy Policy</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-2 offset-xl-1 item'>
            <h3 className='text-light' style={{ fontWeight: 'normal' }}>Contact</h3>
            <ul>
              <li><a href='mailto:support@faa.st' style={{ color: 'rgb(255,255,255)' }}>support@faa.st</a></li>
            </ul>
          </div>
          <div className='col-6 col-sm-6 col-md-2 col-xl-2 offset-md-1 offset-xl-1 item'>
            <h3 className='text-light' style={{ fontWeight: 'normal' }}>Links</h3>
            <ul>
              <li><a href='https://api.faa.st/' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>API</a></li>
              <li><a href='/static/faast-press-kit.zip' target='_blank noopener noreferrer' style={{ color: 'rgb(255,255,255)' }}>Press Kit</a></li>
              <li></li>
            </ul>
          </div>
          <div className='col-lg-12 col-xl-12 offset-lg-0 offset-xl-0 item social text-white' style={{ minHeight: '0px', paddingRight: '0px', paddingLeft: '0px' }}>
            <a href='https://github.com/go-faast'><i className='icon ion-social-github'></i></a>
            <a href='https://www.facebook.com/Faast-237787136707810' target='_blank noopener noreferrer'><i className='icon ion-social-facebook'></i></a>
            <a href='https://twitter.com/gofaast'><i className='icon ion-social-twitter'></i></a>
            <a href='https://slack.faa.st/' target='_blank noopener noreferrer'><i className='fab fa-slack-hash'></i></a>
            <a href='https://www.reddit.com/r/gofaast/' target='_blank noopener noreferrer'><i className='icon ion-social-reddit'></i></a>
            <p className='lead text-white copyright'>© {siteConfig.year} {siteConfig.author}</p>
          </div>
        </div>
      </div>
    </footer>
  </div>
))
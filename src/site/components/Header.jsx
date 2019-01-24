import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, lifecycle } from 'recompose'
import { Link } from 'react-static'
import siteConfig from 'Site/config'
import FaastLogo64x64 from 'Img/faast-logo-64x64.png'

import { darkestText } from './PostPreview/style.scss'

import PropTypes from 'prop-types'
import classNames from 'class-names'

export default compose(
  setDisplayName('Header'),
  setPropTypes({
    theme: PropTypes.string,
    bgColor: PropTypes.string,
    headerColor: PropTypes.string,
  }),
  defaultProps({
    theme: 'dark',
    bgColor: '#181818',
    headerColor: undefined,
  }),
  lifecycle({
    componentWillMount() {
      const { bgColor } = this.props
      if (bgColor !== '#181818') {
        document.body.style.backgroundColor = bgColor
      }
    }
  })
)(({ theme, headerColor }) => (
  <nav className={classNames(darkestText, 'navbar navbar-dark navbar-expand-md navigation-clean-button')}
    style={{ backgroundColor: headerColor ? headerColor : 'transparent', paddingLeft: '12px' }}>
    <div className='container'>
      <Link exact to='/' className={classNames(theme == 'light' ? darkestText : 'text-white','navbar-brand')} style={{ fontWeight: 400 }}>
        <img src={FaastLogo64x64} style={{ height: '32px', marginRight: '16px' }}/>{siteConfig.name}
      </Link>
      <button className='navbar-toggler' data-toggle='collapse' data-target='#navcol-1'>
        <span className='sr-only'>Toggle navigation</span>
        <span className={classNames(theme == 'light' ? darkestText : 'text-white','navbar-toggler-icon')}></span>
      </button>
      <div className='collapse navbar-collapse' id='navcol-1'>
        <ul className='nav navbar-nav ml-auto'>
          <li className='nav-item' role='presentation'>
            <a className={classNames(theme == 'light' ? darkestText : 'text-light', 'nav-link')} href='/app/swap'>Swap</a>
          </li>
          <li className='nav-item' role='presentation'>
            <a className={classNames(theme == 'light' ? darkestText : 'text-light', 'nav-link')} href='https://medium.com/faast' target='_blank noopener noreferrer' rel='noopener'>Blog</a>
          </li>
          <li className='nav-item' role='presentation'>
            <a className='nav-link py-1' href='/app'>
              <button className={classNames(theme == 'light' ? 'btn-primary' : 'btn-light', 'btn')}>Portfolio</button>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
))
import * as React from 'react'
import { compose, setDisplayName } from 'recompose'
import { Link } from 'react-static'
import siteConfig from 'Site/config'
import FaastLogo64x64 from 'Img/faast-logo-64x64.png'

export default compose(
  setDisplayName('Header'),
)(() => (
  <nav className='navbar navbar-dark navbar-expand-md navigation-clean-button'
    style={{ backgroundColor: 'transparent', paddingLeft: '12px' }}>
    <div className='container'>
      <Link exact to='/' className='navbar-brand text-white' style={{ fontWeight: 400 }}>
        <img src={FaastLogo64x64} style={{ height: '32px', marginRight: '16px' }}/>{siteConfig.name}
      </Link>
      <button className='navbar-toggler' data-toggle='collapse' data-target='#navcol-1'>
        <span className='sr-only'>Toggle navigation</span>
        <span className='navbar-toggler-icon text-white'></span>
      </button>
      <div className='collapse navbar-collapse' id='navcol-1'>
        <ul className='nav navbar-nav ml-auto'>
          <li className='nav-item' role='presentation'>
            <a className='nav-link text-light' href='/app/swap'>Swap</a>
          </li>
          <li className='nav-item' role='presentation'>
            <a className='nav-link text-light' href='https://medium.com/faast' target='_blank noopener noreferrer' rel='noopener'>Blog</a>
          </li>
          <li className='nav-item' role='presentation'>
            <a className='nav-link py-1' href='/app'><button className='btn btn-light'>Portfolio</button></a>
          </li>
        </ul>
      </div>
    </div>
  </nav>
))
import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, lifecycle, withHandlers } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { withRouter } from 'react-router'
import siteConfig from 'Site/config'
import FaastLogo64x64 from 'Img/faast-logo-64x64.png'
import { pick } from 'lodash'
import {
  Container,
  Collapse,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarToggler,
} from 'reactstrap'
import withToggle from 'Hoc/withToggle'
import config from 'Config'

import { languageLoad, selectLanguage, correctStaticURL } from 'Common/actions/app'
import { getAppLanguage } from 'Common/selectors/app'
import { darkestText } from '../PostPreview/style.scss'
import LangLink from 'Components/LangLink'
import GAEventButton from 'Components/GAEventButton'

import PropTypes from 'prop-types'
import classNames from 'class-names'

import { betaTag } from './style.scss'

import LanguageSelector from 'Components/LanguageSelector'

export default compose(
  setDisplayName('Header'),
  withRouter,
  setPropTypes({
    theme: PropTypes.string,
    headerColor: PropTypes.string,
    ...Navbar.propTypes
  }),
  connect(createStructuredSelector({
    currentLanguage: getAppLanguage
  }), {
    languageLoad,
    selectLanguage,
    correctStaticURL,
  }),
  lifecycle({
    componentDidMount() {
      const { history, languageLoad, correctStaticURL, currentLanguage } = this.props
      languageLoad()
      const url = correctStaticURL(currentLanguage)
      if (url) history.replace(`${url}`)
    },
  }),
  defaultProps({
    theme: 'dark',
    headerColor: undefined,
    dark: true,
    light: false,
    expand: config.navbar.expand,
  }),
  withHandlers({
    handleSelectLanguage: ({ history, correctStaticURL }) => (lang) => {
      const url = correctStaticURL(lang)
      if (url) history.replace(`${url}`)
    }
  }),
  withToggle('expanded'),
)(({ theme, handleSelectLanguage, headerColor, toggleExpanded, isExpanded, translations: { static: { header = {} } = {}  }, ...props }) => (
  <Navbar {...pick(props, Object.keys(Navbar.propTypes))} expand='md' className={darkestText}
    style={{ border: 0, backgroundColor: headerColor ? headerColor : 'transparent', paddingLeft: '12px' }}>
    <Container>
      <NavbarBrand tag={LangLink} to='' className={classNames((theme == 'light' ? darkestText : 'text-white'))} style={{ fontWeight: 400 }}>
        <img src={FaastLogo64x64} style={{ height: '32px', marginRight: '16px' }}/>{siteConfig.name}
      </NavbarBrand>
      <NavbarToggler onClick={toggleExpanded} />
      <Collapse isOpen={isExpanded} navbar>
        <Nav className='ml-auto' navbar>
          <NavItem className='mr-4' key='swap'>
            <GAEventButton 
              tag={'a'} 
              color='transparent'
              event={{ category: 'Static', action: 'Go to Swap' }}
              className={classNames((theme == 'light' ? darkestText : 'text-light'), 'nav-link')} 
              href='/app/swap'>
              {header.swap}
            </GAEventButton>
          </NavItem>
          <NavItem className='mr-4' key='marketmaker'>
            <NavLink tag={LangLink} className={classNames((theme == 'light' ? darkestText : 'text-light'))} to='/market-maker'>{header.marketMaker} <sup className={classNames(betaTag, 'text-primary')}><i>{header.beta} </i></sup></NavLink>
          </NavItem>
          <NavItem className='mr-4' key='partners'>
            <NavLink tag={LangLink} className={classNames((theme == 'light' ? darkestText : 'text-light'))} to='/partners'>Partners</NavLink>
          </NavItem>
          <NavItem className='mr-4' key='blog'>
            <NavLink tag={'a'} className={classNames((theme == 'light' ? darkestText : 'text-light'))} href='/blog'>{header.blog}</NavLink>
          </NavItem>
          <LanguageSelector onSelect={handleSelectLanguage} theme={theme} />
          <NavItem className='mr-4' key='portfolio'>
            <GAEventButton 
              tag={'a'} 
              className='nav-link py-1' 
              href='/app/connect'
              color='transparent'
              event={{ category: 'Static', action: 'Go to Connect' }} 
            >
              <button className={classNames((theme == 'light' ? 'btn-primary' : 'btn-light'), 'btn')}>{header.button}</button>
            </GAEventButton>
          </NavItem>
        </Nav>
      </Collapse>
    </Container>
  </Navbar>
))
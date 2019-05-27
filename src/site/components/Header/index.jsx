import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps, lifecycle, withProps } from 'recompose'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { Link } from 'react-static'
import siteConfig from 'Site/config'
import FaastLogo64x64 from 'Img/faast-logo-64x64.png'
import BritishFlag from 'Img/united-kingdom.svg?inline'
import JapaneseFlag from 'Img/japan.svg?inline'
import SpanishFlag from 'Img/spain.svg?inline'
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
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle
} from 'reactstrap'
import withToggle from 'Hoc/withToggle'
import config from 'Config'

import Icon from 'Components/Icon'
import { staticAppLoad, selectLanguage } from 'Common/actions/app'
import { getAppLanguage } from 'Common/selectors/app'
import { darkestText } from '../PostPreview/style.scss'

import PropTypes from 'prop-types'
import classNames from 'class-names'

import { betaTag } from './style.scss'

const languages = [
  {
    flag: BritishFlag,
    name: 'English',
    url: '/',
    code: 'en'
  },
  {
    flag: SpanishFlag,
    name: 'Español',
    url: '/es',
    code: 'es'
  },
  {
    flag: JapaneseFlag,
    name: '日本語',
    url: '/ja',
    code: 'ja'
  }
]

export default compose(
  setDisplayName('Header'),
  setPropTypes({
    theme: PropTypes.string,
    headerColor: PropTypes.string,
    ...Navbar.propTypes
  }),
  connect(createStructuredSelector({
    currentLanguage: getAppLanguage
  }), {
    staticAppLoad,
    selectLanguage
  }),
  withProps(({ currentLanguage }) => {
    currentLanguage = languages.find(l => l.code === currentLanguage)
    return ({
      currentLanguage
    })
  }),
  lifecycle({
    componentWillMount() {
      const { staticAppLoad } = this.props
      staticAppLoad()
    },
  }),
  defaultProps({
    theme: 'dark',
    headerColor: undefined,
    dark: true,
    light: false,
    expand: config.navbar.expand,
  }),
  withToggle('expanded'),
  withToggle('dropdownOpen'),
)(({ theme, selectLanguage, currentLanguage, headerColor, isDropdownOpen, toggleDropdownOpen,  toggleExpanded, isExpanded, translations: { static: { header = {} } = {}  }, ...props }) => (
  <Navbar {...pick(props, Object.keys(Navbar.propTypes))} expand='sm' className={darkestText}
    style={{ border: 0, backgroundColor: headerColor ? headerColor : 'transparent', paddingLeft: '12px' }}>
    <Container>
      <NavbarBrand tag={Link} to='/' className={classNames((theme == 'light' ? darkestText : 'text-white'))} style={{ fontWeight: 400 }}>
        <img src={FaastLogo64x64} style={{ height: '32px', marginRight: '16px' }}/>{siteConfig.name}
      </NavbarBrand>
      <NavbarToggler onClick={toggleExpanded} />
      <Collapse isOpen={isExpanded} navbar>
        <Nav className='ml-auto' navbar>
          <NavItem className='mr-4' key='swap'>
            <NavLink tag='a' className={classNames((theme == 'light' ? darkestText : 'text-light'))} href='/app/swap'>{header.swap}</NavLink>
          </NavItem>
          <NavItem className='mr-4' key='marketmaker'>
            <NavLink tag='a' className={classNames((theme == 'light' ? darkestText : 'text-light'))} href='/market-maker'>{header.marketMaker} <sup className={classNames(betaTag, 'text-primary')}><i>{header.beta} </i></sup></NavLink>
          </NavItem>
          <NavItem className='mr-4' key='blog'>
            <NavLink tag='a' className={classNames((theme == 'light' ? darkestText : 'text-light'))} href='/blog'>{header.blog}</NavLink>
          </NavItem>
          <Dropdown nav isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen}>
            <DropdownToggle 
              tag={NavLink} 
              to={'/assets'}
              onClick={((e) => e.preventDefault())}
              className={classNames((theme == 'light' ? darkestText : 'text-light'), 'cursor-pointer mr-4')}
              caret
              nav
            >
              <Icon style={{ width: 20, height: 20, marginRight: 10, position: 'relative', top: -1 }} src={currentLanguage.flag} />
              <span>{currentLanguage.code.toUpperCase()}</span>
            </DropdownToggle>
            <DropdownMenu style={{ borderRadius: 2, borderColor: '#fff' }} className='p-0'>
              {languages.map((lang, i) => (
                <DropdownItem key={lang.url} onClick={() => selectLanguage(lang.code)} tag={Link} to={lang.url} style={{ backgroundColor: '#fff', borderTop: '1px solid #ECEFF7' }} className={classNames(i === 0 && 'border-0','border-left-0 text-muted py-2')}>
                  <Icon style={{ width: 20, height: 20, marginRight: 10 }} src={lang.flag} />
                  <span style={{ color: '#333' }}>{lang.name}</span>
                </DropdownItem>
              ))}
            </DropdownMenu>
          </Dropdown>
          <NavItem className='mr-4' key='portfolio'>
            <NavLink tag='a' className='nav-link py-1' href='/app/connect'>
              <button className={classNames((theme == 'light' ? 'btn-primary' : 'btn-light'), 'btn')}>{header.button}</button>
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Container>
  </Navbar>
))
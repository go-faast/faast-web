import * as React from 'react'
import { compose, setDisplayName, setPropTypes, defaultProps } from 'recompose'
import { Link } from 'react-static'
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

import { darkestText } from '../PostPreview/style.scss'

import PropTypes from 'prop-types'
import classNames from 'class-names'

import { betaTag } from './style.scss'

export default compose(
  setDisplayName('Header'),
  setPropTypes({
    theme: PropTypes.string,
    headerColor: PropTypes.string,
    ...Navbar.propTypes
  }),
  defaultProps({
    theme: 'dark',
    headerColor: undefined,
    dark: true,
    light: false,
    expand: config.navbar.expand,
  }),
  withToggle('expanded'),
)(({ theme, headerColor, toggleExpanded, isExpanded, translations: { static: { header }  }, ...props }) => (
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
          <NavItem className='mr-4' key='portfolio'>
            <NavLink tag='a' className='nav-link py-1' href='/app'>
              <button className={classNames((theme == 'light' ? 'btn-primary' : 'btn-light'), 'btn')}>{header.portfolio}</button>
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
    </Container>
  </Navbar>
))
import React, { Fragment } from 'react'
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
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { setDisplayName, compose, lifecycle } from 'recompose'
import { pick } from 'lodash'
import classNames from 'class-names'

import config from 'Config'
import { isAffiliateLoggedIn } from 'Selectors'
import withToggle from 'Hoc/withToggle'

import { affiliateLogout } from 'Actions/affiliate'

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'
import { hasAcceptedTerms } from 'Selectors/affiliate'

import { navbar, navbarBrand, navbarLink, active } from './style'

const AffiliateNavBar = ({ logout, loggedIn, children, isExpanded, toggleExpanded, hasAcceptedTerms, clickableLogo, ...props }) => (
  <Navbar className={navbar} {...pick(props, Object.keys(Navbar.propTypes))} dark>
    <Container>
      <NavbarBrand tag={clickableLogo ? Link : 'span'} to={loggedIn ? '/affiliates/dashboard' : '/affiliates/login'} className={classNames(navbarBrand, !loggedIn || !hasAcceptedTerms ? 'mx-auto' : 'mr-auto')}>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>
        <span className='text-white'>Faa.st | <span style={{ fontSize: 16 }}>Affiliates</span></span>
      </NavbarBrand>
      {loggedIn && hasAcceptedTerms && (
        <Fragment>
          <NavbarToggler onClick={toggleExpanded}/>
          <Collapse isOpen={isExpanded} navbar>
            <Nav className='mx-auto' navbar>
              <NavItem key='dashboard'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/dashboard'>
                  <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-pie-chart position-relative'/>
                  <span className='ml-2 d-sm-inline'>Dashboard</span>
                </NavLink>
              </NavItem>
              <NavItem key='swaps'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/swaps'>
                  <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-exchange position-relative'/>
                  <span className='ml-2 d-sm-inline'>Swaps</span>
                </NavLink>
              </NavItem>
              <NavItem key='withdrawals'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/withdrawals'>
                  <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-history position-relative'/>
                  <span className='ml-2 nav-link-label d-sm-inline'>Withdrawals</span>
                </NavLink>
              </NavItem>
              <NavItem key='docs'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag='a' href='https://api.faa.st' target='_blank noopener noreferrer'>
                  <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-code position-relative'/>
                  <span className='ml-2 nav-link-label d-sm-inline'>Docs</span>
                </NavLink>
              </NavItem>
              <NavItem key='settings'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/settings'>
                  <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-cog position-relative'/>
                  <span className='ml-2 nav-link-label d-sm-inline'>Settings</span>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
          <div>
            <p onClick={logout} className={classNames(navbarLink, active, 'd-inline cursor-pointer mx-md-0 mx-3')}>
              Logout
            </p>
          </div>
        </Fragment>
      )}
    </Container>
    {children}
  </Navbar>
)

AffiliateNavBar.propTypes = {
  ...Navbar.propTypes
}

AffiliateNavBar.defaultProps = {
  color: 'light',
  dark: false,
  fixed: 'top',
  expand: config.navbar.expand,
}

export default compose(
  setDisplayName('AffiliateNavBar'),
  connect(createStructuredSelector({
    loggedIn: isAffiliateLoggedIn,
    hasAcceptedTerms
  }), {
    logout: affiliateLogout,
  }),
  withToggle('expanded'),
  lifecycle({
    componentWillMount() {
      document.body.style.backgroundColor = '#f5f6fa'
    }
  })
)(AffiliateNavBar)

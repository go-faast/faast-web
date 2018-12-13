import React, { Fragment } from 'react'
import {
  Container,
  Collapse,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
  NavbarToggler
} from 'reactstrap'
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { setDisplayName, compose } from 'recompose'
import { pick } from 'lodash'
import classNames from 'class-names'

import config from 'Config'
import { isAffiliateLoggedIn } from 'Selectors'
import withToggle from 'Hoc/withToggle'

import { affiliateLogout } from 'Actions/affiliate'

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'

import { navbar, navbarBrand, navbarLink, active } from './style'

const AffiliateNavBar = ({ logout, loggedIn, children, isExpanded, toggleExpanded, ...props }) => (
  <Navbar className={navbar} {...pick(props, Object.keys(Navbar.propTypes))}>
    <Container>
      <NavbarBrand tag={Link} to='/affiliates/login' className={classNames(navbarBrand, !loggedIn ? 'mx-auto' : 'mr-auto')}>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>
        Faa.st Affiliates
      </NavbarBrand>
      {loggedIn && (
        <Fragment>
          <NavbarToggler onClick={toggleExpanded} />
          <Collapse isOpen={isExpanded} navbar>
            <Nav className='mx-auto' navbar>
              <NavItem key='dashboard'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/dashboard'>
                  <span className=' d-sm-inline'>Dashboard</span>
                </NavLink>
              </NavItem>
              <NavItem key='swaps'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/swaps'>
                  <span className=' d-sm-inline'>Swaps</span>
                </NavLink>
              </NavItem>
              <NavItem key='payouts'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/payouts'>
                  <span className='nav-link-label d-sm-inline'>Payouts</span>
                </NavLink>
              </NavItem>
              <NavItem key='settings'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/settings'>
                  <span className='nav-link-label d-sm-inline'>Settings</span>
                </NavLink>
              </NavItem>
            </Nav>
          </Collapse>
          <div>
            <p onClick={logout} className={classNames(navbarLink, active, 'd-inline cursor-pointer')}>
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
  color: 'ultra-dark',
  dark: true,
  fixed: 'top',
  expand: config.navbar.expand,
}

export default compose(
  setDisplayName('AffiliateNavBar'),
  connect(createStructuredSelector({
    loggedIn: isAffiliateLoggedIn,
  }), {
    logout: affiliateLogout
  }),
  withToggle('expanded')
)(AffiliateNavBar)

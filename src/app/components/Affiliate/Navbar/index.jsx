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
  Button
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

import { navbar, navbarBrand, navbarLink, active } from './style'

const AffiliateNavBar = ({ logout, loggedIn, children, isExpanded, toggleExpanded, ...props }) => (
  <Navbar className={navbar} {...pick(props, Object.keys(Navbar.propTypes))} light>
    <Container>
      <NavbarBrand tag={Link} to={loggedIn ? '/affiliates/dashboard' : '/affiliates/login'} className={classNames(navbarBrand, !loggedIn ? 'mx-auto' : 'mr-auto')}>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>
        Faa.st Affiliates
      </NavbarBrand>
      {loggedIn && (
        <Fragment>
          <NavbarToggler onClick={toggleExpanded}/>
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
              <NavItem key='withdrawals'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/affiliates/withdrawals'>
                  <span className='nav-link-label d-sm-inline'>Withdrawals</span>
                </NavLink>
              </NavItem>
              <NavItem key='docs'>
                <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag='a' href='https://api.faa.st' target='_blank noopener noreferrer'>
                  <span className='nav-link-label d-sm-inline'>Docs</span>
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
            <Button 
              tag='a' 
              color='primary'
              href='https://faa.st/affiliates/terms' 
              target='_blank noreferrer noopener' 
              className={classNames(navbarLink, active, 'd-none d-md-inline cursor-pointer flat mr-3')}>
              Agreement
            </Button>
          </div>
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
  color: 'light',
  dark: false,
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
  withToggle('expanded'),
  lifecycle({
    componentWillMount() {
      document.body.style.backgroundColor = '#F5F7F8'
    }
  })
)(AffiliateNavBar)

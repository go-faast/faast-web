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
import { push } from 'react-router-redux'
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { setDisplayName, compose, lifecycle, withState } from 'recompose'
import { pick } from 'lodash'
import classNames from 'class-names'
import config from 'Config'
import withToggle from 'Hoc/withToggle'
import { makerLogout } from 'Actions/maker'
import { withAuth } from 'Components/Auth'

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'

import { navbar, navbarBrand, navbarLink, active } from './style'

const MakersNavBar = ({ logoutMaker, children, loggedIn, isExpanded, toggleExpanded, clickableLogo, ...props }) => {
  return (
    <Navbar className={navbar} {...pick(props, Object.keys(Navbar.propTypes))} dark>
      <Container>
        <NavbarBrand tag={clickableLogo ? Link : 'span'} to={loggedIn ? '/makers/dashboard' : '/makers/login'} className={classNames(navbarBrand, !loggedIn ? 'mx-auto' : 'mr-auto')}>
          <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>
          <span className='text-white'>Faa.st | <span style={{ fontSize: 16 }}>Makers</span></span>
        </NavbarBrand>
        {loggedIn && (
          <Fragment>
            <NavbarToggler onClick={toggleExpanded}/>
            <Collapse isOpen={isExpanded} navbar>
              <Nav className='mx-auto' navbar>
                <NavItem key='dashboard'>
                  <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/makers/dashboard'>
                    <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-pie-chart position-relative'/>
                    <span className='ml-2 d-sm-inline'>Dashboard</span>
                  </NavLink>
                </NavItem>
                <NavItem key='swaps'>
                  <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/makers/swaps'>
                    <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-exchange position-relative'/>
                    <span className='ml-2 d-sm-inline'>Swaps</span>
                  </NavLink>
                </NavItem>
                <NavItem key='balances'>
                  <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/makers/balances'>
                    <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-history position-relative'/>
                    <span className='ml-2 nav-link-label d-sm-inline'>Balances</span>
                  </NavLink>
                </NavItem>
                <NavItem key='settings'>
                  <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/makers/settings'>
                    <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-cog position-relative'/>
                    <span className='ml-2 nav-link-label d-sm-inline'>Settings</span>
                  </NavLink>
                </NavItem>
              </Nav>
            </Collapse>
            <div>
              <p onClick={logoutMaker} className={classNames(navbarLink, active, 'd-inline cursor-pointer mx-md-0 mx-3')}>
              Logout
              </p>
            </div>
          </Fragment>
        )}
      </Container>
      {children}
    </Navbar>
  )}

MakersNavBar.propTypes = {
  ...Navbar.propTypes
}

MakersNavBar.defaultProps = {
  color: 'light',
  dark: false,
  fixed: 'top',
  expand: config.navbar.expand,
}

export default compose(
  setDisplayName('MakersNavBar'),
  withAuth(),
  connect(createStructuredSelector({
  }), {
    logoutMaker: makerLogout,
    push
  }),
  withToggle('expanded'),
  withState('loggedIn', 'updateLoggedIn', ({ auth }) => auth.isAuthenticated()),
  lifecycle({
    componentWillMount() {
      document.body.style.backgroundColor = '#f5f6fa'
    },
    componentDidUpdate() {
      const { auth } = this.props
      if (!auth.isAuthenticated()) {
        push('/makers/login')
      }
    }
  })
)(MakersNavBar)

import React from 'react';
import {
  Container,
//  Collapse,
  Navbar,
//  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { push } from 'react-router-redux'
import { createStructuredSelector } from 'reselect'

import config from 'Config'
import { isDefaultPortfolioEmpty } from 'Selectors'

import Icon from 'Components/Icon'
import AddressSearchForm from 'Components/AddressSearchForm'
import FaastLogo from 'Img/faast-logo.png'

const AppNavbar = ({ disablePortfolioLinks, routerPush, children, ...props }) => (
  <Navbar {...props}>
    <Container>
      <NavbarBrand tag={Link} to='/' className='mr-auto'>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>Faast Portfolio <sup className='beta-tag'>beta</sup>
      </NavbarBrand>
      <Nav navbar>
        {!disablePortfolioLinks && ([
          <NavItem key='dashboard'>
            <NavLink tag={RouterNavLink} to='/dashboard'>
              <i className='nav-link-icon fa fa-pie-chart'/>
              <span className='nav-link-label d-none d-md-inline'>Dashboard</span>
            </NavLink>
          </NavItem>,
          <NavItem key='swap'>
            <NavLink tag={RouterNavLink} to='/swap'>
              <i className='nav-link-icon fa fa-exchange'/>
              <span className='nav-link-label d-none d-sm-inline'>Swap</span>
            </NavLink>
          </NavItem>,
          <NavItem key='connect'>
            <NavLink tag={RouterNavLink} to='/connect'>
              <i className='nav-link-icon fa fa-plus'/>
              <span className='nav-link-label d-none d-sm-inline'>Add wallet</span>
            </NavLink>
          </NavItem>
        ])}
      </Nav>
      <AddressSearchForm
        className='d-none d-lg-inline mx-3_4r' size='md' formProps={{ inline: true }} inputGroupProps={{ className: 'flat' }}
        onSubmit={({ address }) => address && routerPush(`/address/${address}`)}/>
    </Container>
    {children}
  </Navbar>
)

AppNavbar.propTypes = {
  ...Navbar.propTypes
}

AppNavbar.defaultProps = {
  color: 'ultra-dark',
  dark: true,
  fixed: 'top',
  expand: config.navbar.expand,
}

export default connect(createStructuredSelector({
  disablePortfolioLinks: isDefaultPortfolioEmpty,
}), {
  routerPush: push,
})(AppNavbar)

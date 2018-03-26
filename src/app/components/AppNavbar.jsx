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

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'

const AppNavbar = ({ children, ...props }) => (
  <Navbar {...props}>
    <Container>
      <NavbarBrand tag={Link} to='/'>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>Faast Portfolio <sup className='beta-tag'>beta</sup>
      </NavbarBrand>
      <Nav className='ml-auto' navbar>
        <NavItem className='expand-only'>
          <NavLink tag={RouterNavLink} to='/dashboard'>
            <i className='nav-link-icon fa fa-pie-chart'/>
            <span className='nav-link-label'>Dashboard</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={RouterNavLink} to='/connect'>
            <i className='nav-link-icon fa fa-plus'/>
            <span className='nav-link-label expand-only'>Add wallet</span>
          </NavLink>
        </NavItem>
        <NavItem>
          <NavLink tag={RouterNavLink} to='/swap'>
            <i className='nav-link-icon fa fa-exchange'/>
            <span className='nav-link-label d-none d-xs-inline'>Swap</span>
          </NavLink>
        </NavItem>
      </Nav>
    </Container>
    {children}
  </Navbar>
)

AppNavbar.defaultProps = {
  color: 'ultra-dark',
  dark: true,
  fixed: 'top',
  expand: 'md',
}

export default AppNavbar
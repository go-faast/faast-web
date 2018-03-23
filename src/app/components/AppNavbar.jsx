import React from 'react';
import {
  Container,
  Collapse,
  Navbar,
  NavbarToggler,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink,
} from 'reactstrap';
import { Link, NavLink as RouterNavLink } from 'react-router-dom'

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'

export default class AppNavbar extends React.Component {
  constructor(props) {
    super(props);

    this.toggle = this.toggle.bind(this);
    this.state = {
      isOpen: false
    };
  }
  toggle() {
    this.setState({
      isOpen: !this.state.isOpen
    });
  }
  render() {
    const { toggle } = this
    const { isOpen } = this.state
    const { children, ...props } = this.props
    return (
      <Navbar color='ultra-dark' dark expand='md' fixed='top' {...props}>
        <Container>
          <NavbarBrand tag={Link} to='/'><Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline/> Faast Portfolio <sup className='beta-tag'>beta</sup></NavbarBrand>
          <NavbarToggler onClick={toggle} />
          <Collapse isOpen={isOpen} navbar>
            <Nav className='ml-auto' navbar>
              <NavItem>
                <NavLink tag={RouterNavLink} to='/balances/'><i className='fa fa-pie-chart'/> Dashboard</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RouterNavLink} to='/connect/'><i className='fa fa-plus'/> add wallet</NavLink>
              </NavItem>
              <NavItem>
                <NavLink tag={RouterNavLink} to='/modify/'><i className='fa fa-exchange'/> swap</NavLink>
              </NavItem>
            </Nav>
          </Collapse>
        </Container>
        {children}
      </Navbar>
    );
  }
}
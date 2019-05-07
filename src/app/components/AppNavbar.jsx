import React from 'react'
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
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { setDisplayName, compose, withProps } from 'recompose'
import { pick } from 'lodash'

import config from 'Config'
import { isDefaultPortfolioEmpty } from 'Selectors'
import { getSavedSwapWidgetInputs } from 'Selectors/app'
import withToggle from 'Hoc/withToggle'

import Icon from 'Components/Icon'
import T from 'Components/i18n/T'
import FaastLogo from 'Img/faast-logo.png'

const AppNavbar = ({ disablePortfolioLinks, children, isExpanded, 
  toggleExpanded, isDropdownOpen, toggleDropdownOpen, queryString, ...props }) => (
  <Navbar {...pick(props, Object.keys(Navbar.propTypes))}>
    <Container>
      <NavbarBrand tag={Link} to='/' className='mr-auto'>
        <Icon src={FaastLogo} height='1.5rem' width='1.5rem' inline className='mx-3'/>Faast Portfolio <sup className='beta-tag'>beta</sup>
      </NavbarBrand>
      <NavbarToggler onClick={toggleExpanded} />
      <Collapse isOpen={isExpanded} navbar>
        <Nav navbar>
          {!disablePortfolioLinks && (
            <NavItem key='dashboard'>
              <NavLink className='px-1 px-lg-2' tag={RouterNavLink} to='/dashboard'>
                <i className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-pie-chart'/>
                <T tag='span' i18nKey='app.nav.dashboard' className='nav-link-label d-sm-inline'>Dashboard</T>
              </NavLink>
            </NavItem>
          )}
          <Dropdown nav isOpen={isDropdownOpen} size="sm" toggle={toggleDropdownOpen} setActiveFromChild>
            <DropdownToggle 
              tag={RouterNavLink} 
              to={'/assets'}
              onClick={((e) => e.preventDefault())}
              className='nav-link position-relative cursor-pointer'
              color='dark' 
              caret
              nav
            >
              <i className="d-inline d-md-none d-lg-inline nav-link-icon fa fa-align-left" aria-hidden="true"></i>
              <T tag='span' i18nKey='app.nav.assets' className='nav-link-label d-sm-inline'>Assets</T>
            </DropdownToggle>
            <DropdownMenu className='p-0'>
              <DropdownItem tag={Link} to={'/assets'} className='text-muted py-2'>
                <T tag='span' i18nKey='app.nav.allAssets'>All Assets</T>
              </DropdownItem>
              <DropdownItem className='m-0' divider/>
              <DropdownItem tag={Link} to={'/assets/trending'} className='text-muted py-2'>
                <T tag='span' i18nKey='app.nav.trending'>Trending</T>
              </DropdownItem>
              <DropdownItem className='m-0' divider/>
              <DropdownItem tag={Link} to={'/assets/watchlist'} className='text-muted py-2'>
                <T tag='span' i18nKey='app.nav.watchlist'>Watchlist</T>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
          {!disablePortfolioLinks && ([
            <NavItem key='rebalance'>
              <NavLink className='px-1 px-lg-2' tag={RouterNavLink} to='/rebalance'>
                <i className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-sliders'/>
                <T tag='span' i18nKey='app.nav.rebalance' className='nav-link-label d-sm-inline'>Rebalance</T>
              </NavLink>
            </NavItem>
          ])}
          <NavItem key='swap'>
            <NavLink className='px-1 px-lg-2' tag={RouterNavLink} to={queryString ? queryString : '/swap'}>
              <i className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-exchange'/>
              <T tag='span' i18nKey='app.nav.swap' className='nav-link-label d-sm-inline'>Swap</T>
            </NavLink>
          </NavItem>
          {!disablePortfolioLinks && (
            <NavItem key='orders'>
              <NavLink className='px-1 px-lg-2' tag={RouterNavLink} to='/orders'>
                <i className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-history'/>
                <T tag='span' i18nKey='app.nav.orders' className='nav-link-label d-sm-inline'>Orders</T>
              </NavLink>
            </NavItem>
          )}
          <NavItem key='connect'>
            <NavLink className='px-1 px-lg-2' tag={RouterNavLink} to='/connect'>
              <i className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-plus'/>
              <T tag='span' i18nKey='app.nav.addWallet' className='nav-link-label d-sm-inline'>Add wallet</T>
            </NavLink>
          </NavItem>
        </Nav>
      </Collapse>
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

export default compose(
  setDisplayName('AppNavBar'),
  connect(createStructuredSelector({
    disablePortfolioLinks: isDefaultPortfolioEmpty,
    previousSwapInputs: getSavedSwapWidgetInputs
  }), {
  }),
  withProps(({ previousSwapInputs }) => { 
    const { toAmount, fromAmount, toAddress, fromAddress, to = 'ETH', from = 'BTC' } = previousSwapInputs || {}
    return ({
      queryString: `/swap?${to && `to=${to}`}${from && `&from=${from}`}${toAmount ? `&toAmount=${toAmount}` : ''}${fromAmount ? `&fromAmount=${fromAmount}` : ''}${toAddress ? `&toAddress=${toAddress}` : '' }${fromAddress ? `&fromAddress=${fromAddress}` : ''}`
    })}),
  withToggle('expanded'),
  withToggle('dropdownOpen'),
)(AppNavbar)

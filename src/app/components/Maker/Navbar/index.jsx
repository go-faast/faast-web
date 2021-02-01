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
import { restoreCachedMakerInfo } from 'Actions/maker'
import { Link, NavLink as RouterNavLink } from 'react-router-dom'
import { connect } from 'react-redux'
import { createStructuredSelector } from 'reselect'
import { setDisplayName, compose, lifecycle } from 'recompose'
import { pick } from 'lodash'
import classNames from 'class-names'
import config from 'Config'
import withToggle from 'Hoc/withToggle'
import { makerLogout } from 'Actions/maker'
import { withAuth } from 'Components/Auth'
import { isMakerLoggedIn, isLoadingData, isMakerOnline, isMakerDisabled, getMakerWarningsCount } from 'Selectors/maker'
import LoadingFullScreen from 'Components/LoadingFullscreen'
import { text } from '../style'

import Icon from 'Components/Icon'
import FaastLogo from 'Img/faast-logo.png'

import { navbar, navbarBrand, navbarLink, active } from './style'

const MakersNavBar = ({ logoutMaker, children, loggedIn, isLoadingData, isExpanded, toggleExpanded, 
  clickableLogo, isMakerOnline, warningCount, ...props }) => {
  return isLoadingData ? (
    <LoadingFullScreen bgColor='#fff' label={<span className={text}>Loading Maker Stats...</span>} />
  ) : (
    <Navbar className={navbar} {...pick(props, Object.keys(Navbar.propTypes))} dark expand='xl'>
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
                <NavItem key='alerts'>
                  <NavLink className={classNames(navbarLink, 'px-1 px-lg-2')} activeClassName={active} tag={RouterNavLink} to='/makers/notifications'>
                    <i style={{ top: 2 }} className='d-inline d-md-none d-lg-inline nav-link-icon fa fa-bell position-relative'/>
                    <span className='ml-2 nav-link-label d-sm-inline'>
                      Alerts {warningCount > -1 ? (
                        <div className='d-inline-block text-center' style={{ width: 18, height: 18, backgroundColor: '#fa483c', color: '#fff', borderRadius: '50%' }}>
                          <small className='position-relative' style={{ top: -3 }}>{warningCount}</small>
                        </div>
                      ) : null}
                    </span>
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
              <div className='px-3 py-0 mr-lg-3 mr-2 d-sm-inline-block d-none' style={{ borderRadius: 20, backgroundColor: 'rgba(255,255,255,.1)' }}>
                <div className='d-inline-block' style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: isMakerOnline ? '#00D8B8' : '#ccc' }}></div> <small>Maker {isMakerOnline ? 'Online' : 'Offline'}</small>
              </div>
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
    loggedIn: isMakerLoggedIn,
    isLoadingData,
    isMakerOnline,
    isMakerDisabled,
    warningCount: getMakerWarningsCount
  }), {
    logoutMaker: makerLogout,
    push,
    restoreCachedMakerInfo
  }),
  withToggle('expanded'),
  lifecycle({
    componentWillMount() {
      document.body.style.backgroundColor = '#f5f6fa'
    },
  })
)(MakersNavBar)

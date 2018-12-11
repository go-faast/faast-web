import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes } from 'recompose'
import { Route, Redirect } from 'react-router-dom'

/**
 * Very similar to normal inexact Redirect but does not erase nested routes.
 * Useful when changing the top level route for many nested routes.
 * 
 * For example, using:
 * `<Redirect from='/connect' to='/portfolio/connect'/>`
 * Would redirect `/connect/hw/trezor` to `/portfolio/connect`. But using:
 * `<RedirectPrefix from='/connect' to='/portfolio/connect'/>`
 * Would redirect `/connect/hw/trezor` to `/portfolio/connect/hw/trezor`
 */
export default compose(
  setDisplayName('RedirectPrefix'),
  setPropTypes({
    from: PropTypes.string,
    to: PropTypes.string,
  }),
)(({ from, to }) => (
  <Route path={from} render={props => (
    <Redirect to={props.location.pathname.replace(from, to)}/>
  )}/>
))

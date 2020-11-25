import React from 'react'
import PropTypes from 'prop-types'
import { compose, setDisplayName, setPropTypes, defaultProps, withProps } from 'recompose'
import { Switch, Route } from 'react-router-dom'
import qs from 'qs'
import urlJoin from 'url-join'

import AuthCallback from './AuthCallback'
import AuthError from './AuthError'

export default compose(
  setDisplayName('AuthRoutes'),
  setPropTypes({
    path: PropTypes.string,
    successPath: PropTypes.string,
    errorComponent: PropTypes.func,
  }),
  defaultProps({
    path: '/auth',
    successPath: '/',
    errorComponent: AuthError,
  }),
  withProps(({ path }) => ({
    errorPath: urlJoin(path, '/error'),
    callbackPath: urlJoin(path, '/callback'),
  }))
)(({ path, callbackPath, errorPath, successPath, errorComponent: ErrorComponent }) => (
  <Route path={path} render={() => (
    <Switch>
      <Route exact path={callbackPath} render={() => (
        <AuthCallback {...({ successPath, errorPath })}/>
      )}/>
      <Route exact path={errorPath} render={({ location: { search } }) => (
        <ErrorComponent {...qs.parse(search.slice(1))}/>
      )}/>
    </Switch>
  )}/>
))
import React from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { withRouter } from 'react-router'

import { init } from 'Actions/app'
import { isAppReady, getAppError, isDefaultPortfolioEmpty, isAppBlocked } from 'Selectors'
import LoadingFullscreen from 'Components/LoadingFullscreen'
import Blocked from 'Components/Blocked'

// Import stylesheets here so they're noticed by HMR
import 'react-redux-toastr/src/styles/index.scss?nsm'
import 'Styles/global?nsm'
import 'faast-ui'

import AppView from './view'

export default compose(
  setDisplayName('App'),
  withRouter,
  connect(createStructuredSelector({
    ready: isAppReady,
    error: getAppError,
    blocked: isAppBlocked,
    hasNoWallets: isDefaultPortfolioEmpty,
  }), {
    initApp: init
  }),
  lifecycle({
    componentWillMount () {
      this.props.initApp()
    }
  }),
  hot(module)
)(({ ready, error, blocked }) => (
  blocked ? (
    <Blocked />
  ) :
    ready ? (
      <AppView/>
    ) : (
      <LoadingFullscreen error={error}/>
    )
))

import React from 'react'
import { compose, setDisplayName, lifecycle } from 'recompose'
import { createStructuredSelector } from 'reselect'
import { connect } from 'react-redux'
import { hot } from 'react-hot-loader'
import { withRouter } from 'react-router'

import { init } from 'Actions/app'
import { isAppReady, getAppError, isDefaultPortfolioEmpty, getSavedSwapWidgetInputs } from 'Selectors'
import LoadingFullscreen from 'Components/LoadingFullscreen'

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
    hasNoWallets: isDefaultPortfolioEmpty,
    previousSwapInputs: getSavedSwapWidgetInputs
  }), {
    initApp: init
  }),
  lifecycle({
    componentWillMount () {
      this.props.initApp()
    }
  }),
  hot(module)
)(({ ready, error }) => (
  ready ? (
    <AppView/>
  ) : (
    <LoadingFullscreen label='Loading Faa.st...' error={error}/>
  )
))
